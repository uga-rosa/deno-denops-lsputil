import { type Denops, execute, is, type LSP, ulid } from "../deps.ts";
import { isPositionBefore } from "../_internal/util.ts";
import type { OffsetEncoding } from "../offset_encoding/mod.ts";
import { toUtf16Range } from "../range/mod.ts";
import { ensureBufnr } from "../assert/mod.ts";

const cacheKey = "denops-lsputil/text_edit@0";

async function ensureApplyer(denops: Denops): Promise<string> {
  if (is.String(denops.context[cacheKey])) {
    return denops.context[cacheKey];
  }
  const suffix = ulid();
  const fnName = `DenopsLsputilApplyTextEdit_${suffix}`;
  denops.context[cacheKey] = fnName;

  const script = `
  function ${fnName}(bufnr, text_edits) abort
    if !bufexists(a:bufnr)
      return
    endif

    let cursor = [-1, -1, -1, -1]
    if bufnr() == a:bufnr
      let virtualedit = &virtualedit
      let &virtualedit = 'all'
      let cursor = getcharpos('.')
      let &virtualedit = virtualedit

      " Convert cursor position into LSP position.
      let cursor[1] -= 1
      let cursor[2] -= 1
    endif
    let is_cursor_fixed = v:false

    let mark_info = getmarklist(a:bufnr)->filter({_, v -> v.mark =~# '^''\\a$'})

    for text_edit in a:text_edits
      let line_count = getbufinfo(a:bufnr)[0].linecount
      if text_edit.range.start.line >= line_count
        " Append lines to the end
        call appendbufline(a:bufnr, '$', text_edit.newText)
      else
        let range = text_edit.range

        " Fix range
        if range.end.line >= line_count
          " Some LSP servers may return +1 range of the buffer content
          let range.end.line = line_count - 1
          let range.end.character = strlen(getbufline(a:bufnr, 1)[0])
        elseif range.end.character > strchars(getbufline(a:bufnr, range.end.line + 1)[0])
          let range.end.character = strchars(getbufline(a:bufnr, range.end.line + 1)[0])
          if !empty(text_edit.newText) && text_edit.newText[-1] ==# ''
            " Properly handling replacement that go beyond the end of a line,
            " and ensuring no extra empty lines are added.
            call remove(text_edit.newText, -1)
          endif
        endif
      endif

      let prefix = strcharpart(getbufline(a:bufnr, range.start.line + 1)[0], 0, range.start.character)
      let suffix = strcharpart(getbufline(a:bufnr, range.end.line + 1)[0], range.end.character)
      let lastNewText = get(text_edit.newText, -1, '')
      if empty(text_edit.newText)
        let text_edit.newText = [prefix . suffix]
      else
        let text_edit.newText[0] = prefix . text_edit.newText[0]
        let text_edit.newText[-1] .= suffix
      endif
      call appendbufline(a:bufnr, range.end.line + 1, text_edit.newText)
      call deletebufline(a:bufnr, range.start.line + 1, range.end.line + 1)

      " If range.end is before or at the same position as the cursor,
      " fix the cursor position.
      if range.end.line < cursor[1] ||
        \\  (range.end.line == cursor[1] && range.end.character <= cursor[2])
        if range.end.line == cursor[1]
          let cursor[2] += -range.end.character + strchars(lastNewText)
          if len(text_edit.newText) == 1
            let cursor[2] += range.start.character
          endif
        endif
        let cursor[1] += len(text_edit.newText) - (range.end.line - range.start.line + 1)
        let is_cursor_fixed = v:true
      endif
    endfor

    let line_count = getbufinfo(a:bufnr)[0].linecount

    " Restore local marks
    for info in mark_info
      let info.pos[1] = min([info.pos[1], line_count])
      let info.pos[2] = min([info.pos[2], strlen(getbufline(a:bufnr, info.pos[1])[0])])
      call setpos(info.mark, info.pos)
    endfor

    " Apply fixed cursor position
    if is_cursor_fixed
      const line = getbufline(a:bufnr, cursor[1] + 1)[0]
      if cursor[1] < line_count && cursor[2] <= strchars(line)
        let cursor[1] += 1
        let cursor[2] += 1
        call setcharpos('.', cursor)
      endif
    endif

    " Remove final line if needed
    if getbufvar(a:bufnr, '&endofline') ||
      \\  (getbufvar(a:bufnr, '&fixendofline') &&
      \\     !getbufvar(a:bufnr, '&binary'))
      if getbufline(a:bufnr, '$')[0] ==# ''
        call deletebufline(denops, bufnr, '$')
      endif
    endif
  endfunction
  `;
  await execute(denops, script);

  return fnName;
}

function fixReversedRange(
  range: LSP.Range,
): LSP.Range {
  const { start, end } = range;
  if (isPositionBefore(end, start)) {
    return { start: end, end: start };
  }
  return range;
}

/**
 * Applies a list of `TextEdit` objects to a buffer.
 * Update the buffer and also move the cursor to the appropriate position.
 *
 * [Specification](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textEdit)
 */
export async function applyTextEdits(
  denops: Denops,
  bufnr: number,
  textEdits: LSP.TextEdit[],
  offsetEncoding: OffsetEncoding = "utf-16",
) {
  bufnr = await ensureBufnr(denops, bufnr);

  textEdits = textEdits.map((textEdit) => ({
    ...textEdit,
    range: fixReversedRange(textEdit.range),
  }));
  // Execute in reverse order.
  textEdits.sort((a, b) =>
    isPositionBefore(a.range.start, b.range.start) ? 1 : -1
  );

  const fnName = await ensureApplyer(denops);
  await denops.call(
    fnName,
    bufnr,
    await (async () => {
      const retval = [];
      for (const textEdit of textEdits) {
        retval.push({
          ...textEdit,
          range: await toUtf16Range(
            denops,
            bufnr,
            textEdit.range,
            offsetEncoding,
          ),
          newText: textEdit.newText.replace(/\r\n?/g, "\n").split("\n"),
        });
      }
      return retval;
    })(),
  );
}

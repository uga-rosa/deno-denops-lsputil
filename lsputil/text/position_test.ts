import { Position } from "./position.ts";
import { assertEquals, assertGreater, assertLess } from "../deps.ts";

Deno.test({
  name: "Position",
  fn: () => {
    const pos = new Position(1, 2);
    assertEquals(pos.line, 1);
    assertEquals(pos.character, 2);
  },
});

Deno.test({
  name: "Position.compareTo",
  fn: async (t) => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 3);
    const pos3 = new Position(2, 2);
    await t.step({
      name: "same line",
      fn: () => {
        assertEquals(pos1.compareTo(pos1), 0);
        assertGreater(pos2.compareTo(pos1), 0);
        assertLess(pos1.compareTo(pos2), 0);
      },
    });
    await t.step({
      name: "different line",
      fn: () => {
        assertGreater(pos3.compareTo(pos1), 0);
        assertLess(pos1.compareTo(pos3), 0);
      },
    });
  },
});

Deno.test({
  name: "Position.isAfter",
  fn: async (t) => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 3);
    const pos3 = new Position(2, 1);
    await t.step({
      name: "same position to be false",
      fn: () => {
        assertEquals(pos1.isAfter(pos1), false);
      },
    });
    await t.step({
      name: "same line",
      fn: () => {
        assertEquals(pos2.isAfter(pos1), true);
        assertEquals(pos1.isAfter(pos2), false);
      },
    });
    await t.step({
      name: "different line",
      fn: () => {
        assertEquals(pos3.isAfter(pos1), true);
        assertEquals(pos1.isAfter(pos3), false);
      },
    });
  },
});

Deno.test({
  name: "Position.isAfterOrEqual",
  fn: async (t) => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 3);
    const pos3 = new Position(2, 1);
    await t.step({
      name: "same position to be true",
      fn: () => {
        assertEquals(pos1.isAfterOrEqual(pos1), true);
      },
    });
    await t.step({
      name: "same line",
      fn: () => {
        assertEquals(pos2.isAfterOrEqual(pos1), true);
        assertEquals(pos1.isAfterOrEqual(pos2), false);
      },
    });
    await t.step({
      name: "different line",
      fn: () => {
        assertEquals(pos3.isAfterOrEqual(pos1), true);
        assertEquals(pos1.isAfterOrEqual(pos3), false);
      },
    });
  },
});

Deno.test({
  name: "Position.isBefore",
  fn: async (t) => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 3);
    const pos3 = new Position(2, 1);
    await t.step({
      name: "same position to be false",
      fn: () => {
        assertEquals(pos1.isBefore(pos1), false);
      },
    });
    await t.step({
      name: "same line",
      fn: () => {
        assertEquals(pos1.isBefore(pos2), true);
        assertEquals(pos2.isBefore(pos1), false);
      },
    });
    await t.step({
      name: "different line",
      fn: () => {
        assertEquals(pos1.isBefore(pos3), true);
        assertEquals(pos3.isBefore(pos1), false);
      },
    });
  },
});

Deno.test({
  name: "Position.isBeforeOrEqual",
  fn: async (t) => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 3);
    const pos3 = new Position(2, 1);
    await t.step({
      name: "same position to be true",
      fn: () => {
        assertEquals(pos1.isBeforeOrEqual(pos1), true);
      },
    });
    await t.step({
      name: "same line",
      fn: () => {
        assertEquals(pos1.isBeforeOrEqual(pos2), true);
        assertEquals(pos2.isBeforeOrEqual(pos1), false);
      },
    });
    await t.step({
      name: "different line",
      fn: () => {
        assertEquals(pos1.isBeforeOrEqual(pos3), true);
        assertEquals(pos3.isBeforeOrEqual(pos1), false);
      },
    });
  },
});

Deno.test({
  name: "Position.isEqual",
  fn: () => {
    const pos1 = new Position(1, 2);
    const pos2 = new Position(1, 2);
    const pos3 = new Position(1, 3);
    assertEquals(pos1.isEqual(pos1), true);
    assertEquals(pos1.isEqual(pos2), true);
    assertEquals(pos1.isEqual(pos3), false);
  },
});

Deno.test({
  name: "Position.translate",
  fn: async (t) => {
    const pos = new Position(1, 2);
    await t.step({
      name: "positive",
      fn: () => {
        const newPos = pos.translate(1, 2);
        assertEquals(newPos.line, 2);
        assertEquals(newPos.character, 4);
      },
    });
    await t.step({
      name: "negative",
      fn: () => {
        const newPos = pos.translate(-1, -2);
        assertEquals(newPos.line, 0);
        assertEquals(newPos.character, 0);
      },
    });
  },
});

Deno.test({
  name: "Position.with",
  fn: async (t) => {
    const pos = new Position(1, 2);
    await t.step({
      name: "no change",
      fn: () => {
        const newPos = pos.with();
        assertEquals(newPos, pos);
      },
    });
    await t.step({
      name: "change line",
      fn: () => {
        const newPos = pos.with(2);
        assertEquals(newPos.line, 2);
        assertEquals(newPos.character, 2);
      },
    });
    await t.step({
      name: "change character",
      fn: () => {
        const newPos = pos.with(undefined, 3);
        assertEquals(newPos.line, 1);
        assertEquals(newPos.character, 3);
      },
    });
    await t.step({
      name: "change both",
      fn: () => {
        const newPos = pos.with(2, 3);
        assertEquals(newPos.line, 2);
        assertEquals(newPos.character, 3);
      },
    });
  },
});

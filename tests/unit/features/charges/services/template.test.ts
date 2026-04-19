import { describe, expect, it } from "vitest";
import { fillTemplate } from "@/features/charges/services/template";

describe("fillTemplate", () => {
  it("replaces all three placeholders", () => {
    const out = fillTemplate(
      "Olá {nome}, vence {vencimento}, valor {valor}.",
      { nome: "João", valor: "R$ 150,00", vencimento: "19/04/2026" },
    );
    expect(out).toBe("Olá João, vence 19/04/2026, valor R$ 150,00.");
  });

  it("replaces multiple occurrences of the same placeholder", () => {
    const out = fillTemplate("{nome} ({nome})", {
      nome: "Ana",
      valor: "",
      vencimento: "",
    });
    expect(out).toBe("Ana (Ana)");
  });

  it("leaves unknown placeholders untouched", () => {
    const out = fillTemplate("Olá {nome}, vence {due}.", {
      nome: "Ana",
      valor: "X",
      vencimento: "Y",
    });
    expect(out).toBe("Olá Ana, vence {due}.");
  });

  it("returns the template unchanged when it has no placeholders", () => {
    expect(fillTemplate("sem variáveis", { nome: "a", valor: "b", vencimento: "c" })).toBe(
      "sem variáveis",
    );
  });

  it("does not substitute braces inside placeholder values", () => {
    const out = fillTemplate("{nome}", {
      nome: "{valor}",
      valor: "R$ 9,99",
      vencimento: "",
    });
    expect(out).toBe("{valor}");
  });
});

export interface TemplateVars {
  nome: string;
  valor: string;
  vencimento: string;
}

export function fillTemplate(template: string, vars: TemplateVars): string {
  let out = "";
  let i = 0;
  while (i < template.length) {
    if (template[i] === "{") {
      const end = template.indexOf("}", i + 1);
      if (end !== -1) {
        const key = template.slice(i + 1, end);
        if (key === "nome" || key === "valor" || key === "vencimento") {
          out += vars[key];
          i = end + 1;
          continue;
        }
      }
    }
    out += template[i];
    i += 1;
  }
  return out;
}

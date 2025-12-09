"use client";

import { CuttingPlan } from "@/lib/cutting-plan";
import type {
  CuttingPlanDocumentProps,
  MaterialPlanProps,
} from "../_docs/cutting-plan-document";

const mockClient = {
  name: "Marcenaria Fina Arte & Design",
  code: "CLI-00123",
};

const generateItems = (baseName: string, qty: number, w: number, h: number) => {
  return Array.from({ length: qty }).map((_, i) => ({
    name: `${baseName} ${i + 1}`,
    w,
    h,
  }));
};

const itemsCozinha = [
  ...generateItems("Lateral Balcão", 6, 72, 58),
  ...generateItems("Base/Tampo", 6, 80, 58),
  ...generateItems("Prateleira Móvel", 8, 76.5, 50),
  ...generateItems("Lateral Gaveta", 12, 50, 15),
  ...generateItems("Contra-Frente", 6, 74, 12),
  ...generateItems("Régua de Fixação", 5, 270, 10),
];

const optimizerConfigBranco = {
  sheetW: 275,
  sheetH: 183,
  margin: 1,
  pieceSpacing: 0.4,
  orientation: "VH" as const,
  wastePercentage: 5,
  items: itemsCozinha,
};

const itemsRoupeiro = [
  ...generateItems("Porta Roupeiro", 3, 45, 260),
  ...generateItems("Lateral Externa", 2, 60, 260),
  ...generateItems("Frente Gaveta", 6, 80, 20),
  ...generateItems("Vista Lateral", 2, 10, 272),
  ...generateItems("Prateleira Maleiro", 3, 100, 55),
];

const optimizerConfigAmadeirado = {
  sheetW: 183,
  sheetH: 275,
  margin: 1,
  pieceSpacing: 0.4,
  orientation: "V" as const,
  wastePercentage: 10,
  items: itemsRoupeiro,
};

const itemsHomeTheater = [
  ...generateItems("Painel TV Fundo", 3, 270, 60),
  ...generateItems("Tampo Rack", 2, 200, 55),
  ...generateItems("Frente Basculante", 4, 90, 35),
  ...generateItems("Prateleira Decor", 2, 150, 25),
  ...generateItems("Rodapé Recuado", 2, 270, 10),
];

const optimizerConfigGrafite = {
  sheetW: 275,
  sheetH: 183,
  margin: 1,
  pieceSpacing: 0.4,
  orientation: "H" as const,
  wastePercentage: 8,
  items: itemsHomeTheater,
};

const planBranco = new CuttingPlan(optimizerConfigBranco).calculate({
  includeImages: true,
});

const planAmadeirado = new CuttingPlan(optimizerConfigAmadeirado).calculate({
  includeImages: true,
});

const planGrafite = new CuttingPlan(optimizerConfigGrafite).calculate({
  includeImages: true,
});

const materialBranco: MaterialPlanProps = {
  id: "mat-branco",
  name: "MDF Branco TX 15mm",
  code: "MDF-BCO-15",
  cutDirection: "VH",
  cutDirectionLabel: "Sentido: Indiferente (Otimizado)",
  pieces: [],
  sheets: planBranco.base64Images.map((img, i) => ({
    id: `b-sheet-${i}`,
    label: `Chapa ${i + 1} (Horizontal)`,
    imageBase64: img,
  })),
};
materialBranco.pieces = itemsCozinha.slice(0, 8).map((p, i) => ({
  id: `bp-${i}`,
  material: materialBranco,
  label: `${p.name} (${p.w} x ${p.h} cm)`,
  qtde: 1,
}));

const materialAmadeirado: MaterialPlanProps = {
  id: "mat-madeira",
  name: "MDF Louro Freijó 18mm",
  code: "MDF-LOU-18",
  cutDirection: "V",
  cutDirectionLabel: "Sentido: Vertical (Chapa em Pé)",
  pieces: [],
  sheets: planAmadeirado.base64Images.map((img, i) => ({
    id: `m-sheet-${i}`,
    label: `Chapa ${i + 1} (Vertical)`,
    imageBase64: img,
  })),
};
materialAmadeirado.pieces = itemsRoupeiro.slice(0, 6).map((p, i) => ({
  id: `mp-${i}`,
  material: materialAmadeirado,
  label: `${p.name} (${p.w} x ${p.h} cm)`,
  qtde: 1,
}));

const materialGrafite: MaterialPlanProps = {
  id: "mat-grafite",
  name: "MDF Grafite Matt 18mm",
  code: "MDF-GRA-18",
  cutDirection: "H",
  cutDirectionLabel: "Sentido: Horizontal (Veio Deitado)",
  pieces: [],
  sheets: planGrafite.base64Images.map((img, i) => ({
    id: `g-sheet-${i}`,
    label: `Chapa ${i + 1} (Horizontal)`,
    imageBase64: img,
  })),
};

materialGrafite.pieces = itemsHomeTheater.slice(0, 6).map((p, i) => ({
  id: `gp-${i}`,
  material: materialGrafite,
  label: `${p.name} (${p.w} x ${p.h} cm)`,
  qtde: 1,
}));

export const cuttingPlanDocMock: CuttingPlanDocumentProps = {
  client: mockClient,
  plan: {
    quoteCode: "ORC-2024-885",
    planCode: "CP-885-REV03",
    title: "Plano de Corte - Completo (H/V/VH)",
    generationDate: new Date().toLocaleDateString("pt-BR"),
    projects: [
      {
        id: "proj-cozinha",
        name: "Cozinha (Branco - Otimizado)",
        qtde: 1,
        materials: [materialBranco],
      },
      {
        id: "proj-dormitorio",
        name: "Roupeiro (Louro Freijó - Vertical)",
        qtde: 1,
        materials: [materialAmadeirado],
      },
      {
        id: "proj-home",
        name: "Home Theater (Grafite - Horizontal)",
        qtde: 1,
        materials: [materialGrafite],
      },
    ],
    notes: `
      Obs: O MDF Branco está configurado sentido livre (VH).
      O MDF Louro Freijó está configurado Vertical (183x275).
      O MDF Grafite está configurado Horizontal (275x183) para painéis longos.
    `,
  },
};

"use client";

import { CuttingPlan, type GrainDirection } from "@/lib/cutting-plan";
import type {
  CuttingPlanDocumentProps,
  MaterialPlanProps,
} from "../_docs/cutting-plan-document";

const mockClient = {
  name: "Marcenaria Fina Arte & Design",
  code: "CLI-00123",
};

const optimizerConfigBranco = {
  sheetW: 275,
  sheetH: 185,
  margin: 0,
  pieceSpacing: 0,
  orientation: "VH" as GrainDirection,
  wastePercentage: 5,
  items: [
    { name: "Porta superior", w: 70, h: 45 },
    { name: "Porta inferior", w: 60, h: 50 },
    { name: "Tampo de pia", w: 120, h: 55 },
    { name: "Lateral do gabinete", w: 85, h: 60 },
    { name: "Fundo do balcão", w: 120, h: 70 },
    { name: "Prateleira interna", w: 55, h: 45 },
    { name: "Divisão vertical", w: 75, h: 50 },
    { name: "Base de gaveta", w: 45, h: 35 },
    { name: "Frente de gaveta", w: 30, h: 15 },
    { name: "Tampa lateral gaveta", w: 40, h: 14 },
    { name: "Suporte pequeno", w: 20, h: 10 },
    { name: "Divisor de talher", w: 28, h: 18 },
    { name: "Nicho auxiliar", w: 25, h: 20 },
    { name: "Prateleira pequena", w: 50, h: 18 },
  ],
};

const optimizerConfigCloset = {
  sheetW: 275,
  sheetH: 185,
  margin: 0,
  pieceSpacing: 0,
  orientation: "V" as GrainDirection,
  wastePercentage: 4,
  items: [
    { name: "Lateral grande", w: 220, h: 45 },
    { name: "Fundo do armário", w: 200, h: 80 },
    { name: "Prateleira grande", w: 120, h: 45 },
    { name: "Divisória interna", w: 85, h: 45 },
    { name: "Porta do closet", w: 210, h: 40 },
    { name: "Divisória estreita", w: 30, h: 45 },
    { name: "Prateleira curta", w: 60, h: 30 },
    { name: "Apoio estrutural", w: 30, h: 25 },
    { name: "Peça técnica", w: 22, h: 14 },
    { name: "Reforço vertical", w: 70, h: 10 },
    { name: "Mini prateleira", w: 45, h: 20 },
    { name: "Suporte de encaixe", w: 20, h: 12 },
  ],
};

const optimizerConfigGrafite = {
  sheetW: 275,
  sheetH: 185,
  margin: 0,
  pieceSpacing: 0,
  orientation: "H" as GrainDirection,
  wastePercentage: 6,
  items: [
    { name: "Painel principal", w: 200, h: 180 },
    { name: "Contrapainel", w: 190, h: 170 },
    { name: "Nicho decorativo", w: 60, h: 30 },
    { name: "Nicho auxiliar", w: 50, h: 25 },
    { name: "Base inferior", w: 180, h: 40 },
    { name: "Prateleira flutuante", w: 120, h: 25 },
    { name: "Friso decorativo", w: 60, h: 8 },
    { name: "Borda acabamento", w: 80, h: 10 },
    { name: "Suporte de fixação", w: 30, h: 15 },
    { name: "Apoio de fundo", w: 50, h: 20 },
    { name: "Reforço para TV", w: 40, h: 25 },
    { name: "Peça técnica painel", w: 25, h: 18 },
  ],
};

const planBranco = new CuttingPlan(optimizerConfigBranco).calculate({
  includeImages: true,
});
const planCloset = new CuttingPlan(optimizerConfigCloset).calculate({
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
  sheets: planBranco.base64Images.map((img: any, i: number) => ({
    id: `s-b-${i + 1}`,
    label: `Chapa ${i + 1} (275x185 cm)`,
    imageBase64: img,
  })),
};
materialBranco.pieces = optimizerConfigBranco.items.map((p, i) => ({
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
  sheets: planCloset.base64Images.map((img: any, i: number) => ({
    id: `s-m-${i + 1}`,
    label: `Chapa ${i + 1} (275x185 cm)`,
    imageBase64: img,
  })),
};
materialAmadeirado.pieces = optimizerConfigCloset.items.map((piece, i) => ({
  id: `mp-${i}`,
  material: materialAmadeirado,
  label: `${piece.name} (${piece.w}x${piece.h} cm)`,
  qtde: 1,
}));

const materialGrafite: MaterialPlanProps = {
  id: "mat-grafite",
  name: "MDF Grafite Matt 18mm",
  code: "MDF-GRA-18",
  cutDirection: "H",
  cutDirectionLabel: "Sentido: Horizontal (Veio Deitado)",
  pieces: [],
  sheets: planGrafite.base64Images.map((img: any, i: number) => ({
    id: `s-g-${i + 1}`,
    label: `Chapa ${i + 1} (275x185 cm)`,
    imageBase64: img,
  })),
};
materialGrafite.pieces = optimizerConfigGrafite.items.map((piece, i) => ({
  id: `gp-${i}`,
  material: materialGrafite,
  label: `${piece.name} (${piece.w}x${piece.h} cm)`,
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

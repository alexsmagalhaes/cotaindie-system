"use client";

import { CuttingPlan } from "@/lib/cutting-plan";
import type {
  CuttingPlanDocumentProps,
  MaterialPlanProps,
  PlanDataProps,
} from "../_docs/cutting-plan-document";

const mockClient = {
  name: "Cliente exemplo",
  code: "C38223",
};

const optimizerConfigCozinha = {
  sheetW: 275,
  sheetH: 185,
  margin: 0,
  pieceSpacing: 0,
  allowRotate: true,
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
  allowRotate: true,
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

const optimizerConfigPainel = {
  sheetW: 275,
  sheetH: 185,
  margin: 0,
  pieceSpacing: 0,
  allowRotate: true,
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

const planCozinha = new CuttingPlan(optimizerConfigCozinha).calculate({
  includeImages: true,
});
const planCloset = new CuttingPlan(optimizerConfigCloset).calculate({
  includeImages: true,
});
const planPainel = new CuttingPlan(optimizerConfigPainel).calculate({
  includeImages: true,
});

const materialCozinha: MaterialPlanProps = {
  id: "mat1",
  name: "MDF Branco 18MM",
  code: "M28321",
  cutDirection: "VH",
  cutDirectionLabel: "Corte: Horizontal e vertical",
  pieces: [],
  sheets: planCozinha.base64Images.map((img, i) => ({
    id: `s${i + 1}`,
    label: `Chapa ${i + 1} (275x185 cm)`,
    imageBase64: img,
  })),
};
materialCozinha.pieces = optimizerConfigCozinha.items.map((piece, i) => ({
  id: `p${i + 1}`,
  material: materialCozinha,
  label: `- ${piece.name} (${piece.w}x${piece.h} cm)`,
  qtde: 1,
}));

const materialCloset: MaterialPlanProps = {
  id: "mat2",
  name: "MDF Carvalho 18MM",
  code: "M28322",
  cutDirection: "VH",
  cutDirectionLabel: "Corte: Horizontal e vertical",
  pieces: [],
  sheets: planCloset.base64Images.map((img, i) => ({
    id: `s${i + 50}`,
    label: `Chapa ${i + 50} (275x185 cm)`,
    imageBase64: img,
  })),
};
materialCloset.pieces = optimizerConfigCloset.items.map((piece, i) => ({
  id: `p${i + 100}`,
  material: materialCloset,
  label: `- ${piece.name} (${piece.w}x${piece.h} cm)`,
  qtde: 1,
}));

const materialPainel: MaterialPlanProps = {
  id: "mat3",
  name: "MDF Amadeirado 15MM",
  code: "M28323",
  cutDirection: "VH",
  cutDirectionLabel: "Corte: Horizontal e vertical",
  pieces: [],
  sheets: planPainel.base64Images.map((img, i) => ({
    id: `s${i + 100}`,
    label: `Chapa ${i + 100} (275x185 cm)`,
    imageBase64: img,
  })),
};
materialPainel.pieces = optimizerConfigPainel.items.map((piece, i) => ({
  id: `p${i + 200}`,
  material: materialPainel,
  label: `- ${piece.name} (${piece.w}x${piece.h} cm)`,
  qtde: 1,
}));

const mockPlan: PlanDataProps = {
  quoteCode: "C29115",
  planCode: "P29115",
  title: "Plano de corte automático",
  generationDate: new Date().toLocaleString("pt-BR"),
  projects: [
    {
      id: "proj1",
      name: "Móveis da cozinha",
      qtde: 1,
      materials: [materialCozinha],
    },
    {
      id: "proj2",
      name: "Closet do quarto",
      qtde: 1,
      materials: [materialCloset],
    },
    {
      id: "proj3",
      name: "Painel da sala",
      qtde: 1,
      materials: [materialPainel],
    },
  ],
  notes: `
    Aproveitamento médio: ${(
      ((planCozinha.totalFractionalSheets +
        planCloset.totalFractionalSheets +
        planPainel.totalFractionalSheets) /
        (planCozinha.totalIntegerSheets +
          planCloset.totalIntegerSheets +
          planPainel.totalIntegerSheets)) *
      100
    ).toFixed(2)}%
  `,
};

export const cuttingPlanDocMock: CuttingPlanDocumentProps = {
  client: mockClient,
  plan: mockPlan,
};

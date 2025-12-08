type CutDirection = "V" | "VH" | "H";

interface Material {
  id: string;
  code: string;
  category: Category;
  name: string;
  description: string;
  measureType: "M2" | "ML" | "UN";
  unit: "CM" | "UN";
  wasteTax: number;
  baseValue: number;
  measure: [number] | [number, number];
  cutDirection?: CutDirection;
}

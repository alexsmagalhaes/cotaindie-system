import { Document, Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import { DataGrid, DataGridCell, DataGridRow } from "../_components/data-grid";
import { DocumentTitle } from "../_components/document-title";
import { Footer } from "../_components/footer";
import { Header } from "../_components/header";
import { Hr } from "../_components/hr";
import { PdfPageLayout } from "../_components/pdf-layout";
import { SectionTitle } from "../_components/section-title";
import { TitledTextSection } from "../_components/title-text-section";
import { horizontalIcon } from "../assets/horizontal-icon";
import { vhIcon } from "../assets/vertical-horizontal-icon";
import { verticalIcon } from "../assets/vertical-icon";

export interface ClientProps {
  name: string;
  code?: string;
}

export interface PiecePlanProps {
  material: any;
  id: string;
  label: string;
  qtde: number | string;
}

export interface SheetPlanProps {
  id: string;
  label: string;
  imageBase64: string;
  sheetMeasure?: [number, number];
}

export interface MaterialPlanProps {
  id: string;
  name: string;
  code: string;
  cutDirection: "H" | "V" | "VH";
  cutDirectionLabel: string;
  pieces: PiecePlanProps[];
  sheets: SheetPlanProps[];
  sheetMeasure?: [number, number];
}

export interface ProjectPlanProps {
  id: string;
  name: string;
  qtde: number;
  materials: MaterialPlanProps[];
}

export interface PlanDataProps {
  quoteCode: string;
  planCode: string;
  title: string;
  generationDate: string;
  projects: ProjectPlanProps[];
  notes?: string;
}

export interface CuttingPlanDocumentProps {
  client: ClientProps;
  plan: PlanDataProps;
}

export const CuttingPlanDocument = ({
  client,
  plan,
}: CuttingPlanDocumentProps) => (
  <Document>
    <PdfPageLayout
      header={
        <Header
          variant="simple"
          docCode={plan.quoteCode}
          dateTime={plan.generationDate}
        />
      }
      footer={({ pageNumber, totalPages }) => (
        <Footer
          variant="default"
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      )}
    >
      <Hr />
      <DocumentTitle code={plan.planCode} title={plan.title} />
      <SectionTitle>Dados do cliente</SectionTitle>
      <DataGrid>
        <DataGridRow noBorderBottom>
          <DataGridCell width="70%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Nome: </Text>
              {client.name}
            </Text>
          </DataGridCell>
          <DataGridCell width="30%" noBorderRight>
            <Text>
              <Text style={{ fontWeight: 700 }}>Código: </Text>
              {client.code || "N/A"}
            </Text>
          </DataGridCell>
        </DataGridRow>
      </DataGrid>
      <SectionTitle>Projetos no plano</SectionTitle>
      <DataGrid>
        <DataGridRow isHeader>
          <DataGridCell width="10%" align="center" isHeader>
            Nº
          </DataGridCell>
          <DataGridCell flex={1} isHeader>
            Projetos
          </DataGridCell>
          <DataGridCell width="15%" align="center" isHeader noBorderRight>
            Qtde
          </DataGridCell>
        </DataGridRow>
        {plan.projects
          .filter((p) => p.id !== "grouped")
          .map((project, index, arr) => (
            <DataGridRow
              key={project.id}
              noBorderBottom={index === arr.length - 1}
            >
              <DataGridCell width="10%" align="center">
                {index + 1}
              </DataGridCell>
              <DataGridCell flex={1}>{project.name}</DataGridCell>
              <DataGridCell width="15%" align="center" noBorderRight>
                {project.qtde}
              </DataGridCell>
            </DataGridRow>
          ))}
      </DataGrid>
      <SectionTitle>Projetos por materiais</SectionTitle>
      {plan.projects.map((project) => (
        <React.Fragment key={project.id}>
          {project.materials.map((material, materialIndex) => {
            const measure = material.sheetMeasure;
            const measureLabel = measure
              ? `(${measure[0]} x ${measure[1]} cm)`
              : "";

            return (
              <View key={material.id} wrap={true} style={{ marginBottom: 12 }}>
                <DataGrid>
                  <DataGridRow isHeader style={{ backgroundColor: "#f0f0f0" }}>
                    <DataGridCell width="10%" align="center">
                      {materialIndex + 1}
                    </DataGridCell>
                    <DataGridCell style={{ fontWeight: 700 }} flex={1}>
                      {`${material.name} - ${material.code} ${measureLabel}`}
                    </DataGridCell>
                    <DataGridCell style={{ fontWeight: 700 }}>
                      {material.cutDirectionLabel}
                    </DataGridCell>
                    <DataGridCell
                      width="15%"
                      align="center"
                      isHeader
                      noBorderRight
                    >
                      Qtde
                    </DataGridCell>
                  </DataGridRow>
                  {material.pieces.map((piece, pieceIndex, arr) => (
                    <DataGridRow
                      key={piece.id}
                      noBorderBottom={
                        pieceIndex === arr.length - 1 &&
                        material.sheets.length === 0
                      }
                    >
                      <DataGridCell width="10%" align="center">
                        {`${materialIndex + 1}.${pieceIndex + 1}`}
                      </DataGridCell>
                      <DataGridCell flex={1}>
                        <Text>
                          {piece.label}
                          {(piece as any)._measure &&
                            ` (${(piece as any)._measure[0]} x ${(piece as any)._measure[1]} cm)`}
                        </Text>
                      </DataGridCell>
                      <DataGridCell width="15%" align="center" noBorderRight>
                        {piece.qtde}
                      </DataGridCell>
                    </DataGridRow>
                  ))}
                  {material.sheets.map((sheet, sheetIndex, arr) => {
                    const isVertical =
                      sheet.sheetMeasure &&
                      sheet.sheetMeasure[1] > sheet.sheetMeasure[0];
                    const maxHeight = isVertical ? 400 : 600;

                    return (
                      <View key={sheet.id} wrap={false}>
                        <DataGridRow
                          noBorderBottom={sheetIndex === arr.length - 1}
                        >
                          <DataGridCell
                            width="100%"
                            noBorderRight
                            style={{ padding: 0, marginBottom: 4 }}
                          >
                            <View style={{ padding: 8 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginBottom: 0,
                                  paddingLeft: 5,
                                }}
                              >
                                <View
                                  style={{
                                    width: 16,
                                    height: 16,
                                    marginRight: 10,
                                  }}
                                >
                                  {material.cutDirection === "VH" && (
                                    <Image
                                      style={{ width: 16, height: 16 }}
                                      src={vhIcon}
                                    />
                                  )}
                                  {material.cutDirection === "V" && (
                                    <Image
                                      style={{ width: 16, height: 16 }}
                                      src={verticalIcon}
                                    />
                                  )}
                                  {material.cutDirection === "H" && (
                                    <Image
                                      style={{ width: 16, height: 16 }}
                                      src={horizontalIcon}
                                    />
                                  )}
                                </View>
                                <View>
                                  <Text
                                    style={{ marginBottom: 2, marginTop: 3 }}
                                  >
                                    {sheet.label}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 7,
                                      color: "#444",
                                      marginBottom: 4,
                                    }}
                                  >
                                    Textura/corte:{" "}
                                    {material.cutDirection === "VH" &&
                                      "Horizontal e Vertical"}
                                    {material.cutDirection === "V" &&
                                      "Apenas Vertical"}
                                    {material.cutDirection === "H" &&
                                      "Apenas Horizontal"}
                                  </Text>
                                </View>
                              </View>
                              <View
                                style={{
                                  width: "100%",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Image
                                  src={sheet.imageBase64}
                                  style={{
                                    width: "100%",
                                    maxWidth: "100%",
                                    maxHeight: maxHeight,
                                    objectFit: "contain",
                                  }}
                                />
                              </View>
                            </View>
                          </DataGridCell>
                        </DataGridRow>
                      </View>
                    );
                  })}
                </DataGrid>
              </View>
            );
          })}
        </React.Fragment>
      ))}

      {plan.notes && (
        <TitledTextSection title="Observações e outros:">
          {plan.notes}
        </TitledTextSection>
      )}
    </PdfPageLayout>
  </Document>
);

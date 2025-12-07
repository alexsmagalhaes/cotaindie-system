import { Document, Text } from "@react-pdf/renderer";
import { DataGrid, DataGridCell, DataGridRow } from "../_components/data-grid";
import { DocumentTitle } from "../_components/document-title";
import { Footer } from "../_components/footer";
import { Header } from "../_components/header";
import { Hr } from "../_components/hr";
import { PdfPageLayout } from "../_components/pdf-layout";
import { SectionTitle } from "../_components/section-title";
import { SummaryBlock } from "../_components/summary-block";
import { TitledTextSection } from "../_components/title-text-section";

interface CompanyProps {
  name: string;
  details: string;
  address: string;
  phone: string;
}

export interface ClientProps {
  name: string;
  code?: string;
  document?: string;
  phone?: string;
  email?: string;
  address: {
    street: string;
    complement?: string;
    neighborhood: string;
    city: string;
    cep?: string;
  };
}

export interface QuoteProjectProps {
  name: string;
  qtde: number;
  unitPrice: string;
  totalPrice: string;
}

interface PaymentProps {
  initialDate: string;
  paymentMethod: string;
  advanceAmount: string;
  deliveryDays?: number;
  remainingPaymentInfo: string;
  installmentsInfo: string;
}

interface QuoteDataProps {
  code: string;
  name: string;
  generationDate: string;

  projects: QuoteProjectProps[];

  included?: string;
  excluded?: string;

  rawAmount: string;
  discountPercent: number;
  discountAmount: string;
  finalAmount: string;

  notes?: string;
}

export interface QuoteDocumentProps {
  company: CompanyProps;
  client: ClientProps;
  order: QuoteDataProps;
  payment: PaymentProps;
}

export const QuoteDocument = ({
  company,
  client,
  order,
  payment,
}: QuoteDocumentProps) => (
  <Document>
    <PdfPageLayout
      header={
        <Header
          variant="detailed"
          company={company}
          dateTime={order.generationDate}
        />
      }
      footer={({ pageNumber, totalPages }) => (
        <Footer
          variant="quote"
          pageNumber={pageNumber}
          totalPages={totalPages}
          dateTime={order.generationDate}
        />
      )}
    >
      <Hr />
      <DocumentTitle code={order.code} title={order.name} />
      <SectionTitle>Dados do cliente</SectionTitle>
      <DataGrid>
        <DataGridRow>
          <DataGridCell width="60%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Nome: </Text>
              {client.name}
            </Text>
          </DataGridCell>
          <DataGridCell width="40%" noBorderRight>
            <Text>
              <Text style={{ fontWeight: 700 }}>Código: </Text>
              {client.code || "N/A"}
            </Text>
          </DataGridCell>
        </DataGridRow>
        <DataGridRow>
          <DataGridCell width="35%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Cidade: </Text>
              {client.address.city}
            </Text>
          </DataGridCell>
          <DataGridCell width="25%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Cep: </Text>
              {client.address.cep || "N/A"}
            </Text>
          </DataGridCell>
          <DataGridCell width="40%" noBorderRight>
            <Text>
              <Text style={{ fontWeight: 700 }}>Bairro: </Text>
              {client.address.neighborhood}
            </Text>
          </DataGridCell>
        </DataGridRow>
        <DataGridRow>
          <DataGridCell width="35%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Número: </Text>
              {client.address.complement || "SN"}
            </Text>
          </DataGridCell>
          <DataGridCell width="65%" noBorderRight>
            <Text>
              <Text style={{ fontWeight: 700 }}>Endereço: </Text>
              {client.address.street}
            </Text>
          </DataGridCell>
        </DataGridRow>
        <DataGridRow noBorderBottom>
          <DataGridCell width="35%">
            <Text>
              <Text style={{ fontWeight: 700 }}>CPF/ CNPJ: </Text>
              {client.document || "N/A"}
            </Text>
          </DataGridCell>
          <DataGridCell width="25%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Telefone: </Text>
              {client.phone || "N/A"}
            </Text>
          </DataGridCell>
          <DataGridCell width="40%" noBorderRight>
            <Text>
              <Text style={{ fontWeight: 700 }}>Email: </Text>
              {client.email || "N/A"}
            </Text>
          </DataGridCell>
        </DataGridRow>
      </DataGrid>
      <SectionTitle>Projetos inclusos</SectionTitle>
      <DataGrid>
        <DataGridRow isHeader>
          <DataGridCell width="10%" align="center" isHeader>
            N°
          </DataGridCell>
          <DataGridCell width="50%" isHeader>
            Projeto
          </DataGridCell>
          <DataGridCell width="10%" align="center" isHeader>
            Qtde
          </DataGridCell>
          <DataGridCell width="15%" isHeader>
            Valor unitário
          </DataGridCell>
          <DataGridCell width="15%" isHeader noBorderRight>
            Valor total
          </DataGridCell>
        </DataGridRow>
        {order.projects.map((project, index) => (
          <DataGridRow
            key={index}
            noBorderBottom={index === order.projects.length - 1}
          >
            <DataGridCell width="10%" align="center">
              {index + 1}
            </DataGridCell>
            <DataGridCell width="50%">{project.name}</DataGridCell>
            <DataGridCell width="10%" align="center">
              {project.qtde}
            </DataGridCell>
            <DataGridCell width="15%">{project.unitPrice}</DataGridCell>
            <DataGridCell width="15%" noBorderRight>
              {project.totalPrice}
            </DataGridCell>
          </DataGridRow>
        ))}
      </DataGrid>
      <SummaryBlock
        discountLabel={`Desconto de: ${order.discountPercent}%`}
        orderValue={order.rawAmount}
        discountValue={order.discountAmount}
        totalValue={order.finalAmount}
      />
      {order.included && (
        <TitledTextSection title="Materiais inclusos:">
          {order.included}
        </TitledTextSection>
      )}
      {order.excluded && (
        <TitledTextSection title="Materiais exclusos:">
          {order.excluded}
        </TitledTextSection>
      )}
      <SectionTitle>Condições de pagamento</SectionTitle>
      <DataGrid>
        <DataGridRow>
          <DataGridCell width="50%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Pagamento inicial: </Text>
              {payment.paymentMethod}
            </Text>
          </DataGridCell>
          <DataGridCell width="50%" noBorderRight>
            <Text>
              <Text style={{ fontWeight: 700 }}>Adiantamento: </Text>
              {payment.advanceAmount}
            </Text>
          </DataGridCell>
        </DataGridRow>
        <DataGridRow>
          <DataGridCell width="50%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Data da venda: </Text>
              {payment.initialDate}
            </Text>
          </DataGridCell>
          <DataGridCell width="50%" noBorderRight>
            <Text>
              <Text style={{ fontWeight: 700 }}>Pagamento do restante: </Text>
              {payment.remainingPaymentInfo}
            </Text>
          </DataGridCell>
        </DataGridRow>
        <DataGridRow noBorderBottom>
          <DataGridCell width="50%">
            <Text>
              <Text style={{ fontWeight: 700 }}>Previsão de entrega: </Text>
              {`${payment.deliveryDays} dias úteis após a data da venda`}{" "}
            </Text>
          </DataGridCell>
          <DataGridCell width="50%" noBorderRight>
            <Text>
              <Text style={{ fontWeight: 700 }}>Restante: </Text>
              {payment.installmentsInfo}
            </Text>
          </DataGridCell>
        </DataGridRow>
      </DataGrid>
      {order.notes && (
        <TitledTextSection title="Observações e outros:">
          {order.notes}
        </TitledTextSection>
      )}
    </PdfPageLayout>
  </Document>
);

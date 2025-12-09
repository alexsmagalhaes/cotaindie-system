import { Image, Text, View } from "@react-pdf/renderer";
import { Hr } from "./hr";

interface FooterProps {
  variant: "quote" | "default";
  pageNumber: number;
  totalPages: number;
  dateTime?: string;
}

export const Footer = ({
  variant,
  pageNumber,
  totalPages,
  dateTime,
}: Readonly<FooterProps>) => {
  let quoteText = "";

  if (dateTime) {
    quoteText = `Orçamento gerado em ${dateTime}`;
  }

  const defaultText = "";
  const footerText = variant === "quote" ? quoteText : defaultText;

  return (
    <View style={{ paddingTop: 20 }}>
      <Hr />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 8,
        }}
      >
        <View style={{ width: 66, height: 18 }}>
          <Image
            src="/images/logo-pdf.png"
            style={{ width: 64.5, height: 17 }}
          />
          {/* <Logo /> */}
        </View>
        <Text>
          {footerText ? `${footerText} | ` : ""}
          Página {pageNumber} de {totalPages}
        </Text>
      </View>
    </View>
  );
};

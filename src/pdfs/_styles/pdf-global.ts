import { Font, StyleSheet } from "@react-pdf/renderer";

Font.register({
  family: "Inter Tight",
  fonts: [
    { src: "/fonts/inter-tight-regular.ttf", fontWeight: "normal" },
    { src: "/fonts/inter-tight-bold.ttf", fontWeight: "bold" },
  ],
});

export const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    fontFamily: "Inter Tight",
    backgroundColor: "#fff",
    color: "#000",
    paddingTop: 88,
    paddingBottom: 64,
    paddingHorizontal: 40,
  },
  pageContent: {
    position: "relative",
    zIndex: 100,
  },
  fixedHeader: {
    position: "absolute",
    top: 32,
    left: 40,
    right: 40,
  },
  fixedFooter: {
    position: "absolute",
    bottom: 32,
    left: 40,
    right: 40,
  },
});

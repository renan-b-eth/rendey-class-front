import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold" },
  section: { marginTop: 10 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: "center",
  },
});

export function StudentReport({
  school,
  teacher,
  classroom,
  student,
  content,
}: any) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{school}</Text>
          <Text>Professor: {teacher}</Text>
          <Text>Turma: {classroom}</Text>
          <Text>Aluno: {student}</Text>
        </View>

        <View style={styles.section}>
          <Text>{content}</Text>
        </View>

        <Text style={styles.footer}>
          Relatório gerado pelo Rendey Class
        </Text>
      </Page>
    </Document>
  );
}

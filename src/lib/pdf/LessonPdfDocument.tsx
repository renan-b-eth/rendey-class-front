import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Lesson } from "@/lib/store";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  header: { marginBottom: 12 },
  title: { fontSize: 18, marginBottom: 6 },
  meta: { fontSize: 10, color: "#666" },
  section: { marginTop: 12 },
  h2: { fontSize: 12, marginBottom: 6 },
  body: { fontSize: 11, lineHeight: 1.4 }
});

export function LessonPdfDocument({ lesson }: { lesson: Lesson }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.meta}>
            {lesson.subject} • {lesson.grade} • {lesson.durationMin} min
          </Text>
          {lesson.topic ? <Text style={styles.meta}>Topic: {lesson.topic}</Text> : null}
        </View>

        {lesson.objectives ? (
          <View style={styles.section}>
            <Text style={styles.h2}>Objectives</Text>
            <Text style={styles.body}>{lesson.objectives}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.h2}>Lesson Plan</Text>
          <Text style={styles.body}>{lesson.contentMd}</Text>
        </View>

        {lesson.tags?.length ? (
          <View style={styles.section}>
            <Text style={styles.h2}>Tags</Text>
            <Text style={styles.body}>{lesson.tags.join(", ")}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

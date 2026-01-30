import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Lesson } from "@/lib/store";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 6 },
  meta: { fontSize: 10, color: "#444", marginBottom: 12 },
  sectionTitle: { fontSize: 12, marginTop: 10, marginBottom: 6 },
  paragraph: { lineHeight: 1.4 }
});

function mdToPlain(md: string) {
  return md
    .replace(/^###\s+/gm, "")
    .replace(/^##\s+/gm, "")
    .replace(/^#\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1");
}

export function LessonPdf({ lesson }: { lesson: Lesson }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.meta}>
          {lesson.subject} • {lesson.grade} • {lesson.durationMin} min
        </Text>

        {lesson.topic ? (
          <>
            <Text style={styles.sectionTitle}>Topic</Text>
            <Text style={styles.paragraph}>{lesson.topic}</Text>
          </>
        ) : null}

        {lesson.objectives ? (
          <>
            <Text style={styles.sectionTitle}>Objectives</Text>
            <Text style={styles.paragraph}>{mdToPlain(lesson.objectives)}</Text>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Lesson plan</Text>
        <Text style={styles.paragraph}>{mdToPlain(lesson.contentMd)}</Text>

        {lesson.tags?.length ? (
          <>
            <Text style={styles.sectionTitle}>Tags</Text>
            <Text style={styles.paragraph}>{lesson.tags.join(", ")}</Text>
          </>
        ) : null}
      </Page>
    </Document>
  );
}

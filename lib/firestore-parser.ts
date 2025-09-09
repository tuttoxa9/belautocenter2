// lib/firestore-parser.ts

/** Преобразует ОДНО поле из формата Firestore в обычное JS-значение. */
function parseFirestoreValue(value: any): any {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.mapValue !== undefined) return parseFirestoreDoc(value.mapValue);
  if (value.arrayValue !== undefined) return (value.arrayValue.values || []).map(parseFirestoreValue);
  if (value.nullValue !== undefined) return null;
  return undefined;
}

/** Преобразует ВЕСЬ документ Firestore в простой JS-объект. */
export function parseFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return {};

  const result: { [key: string]: any } = {};
  for (const key in doc.fields) {
    result[key] = parseFirestoreValue(doc.fields[key]);
  }

  // Добавляем ID документа, если он есть
  if (doc.name) {
    result.id = doc.name.split('/').pop();
  }

  return result;
}

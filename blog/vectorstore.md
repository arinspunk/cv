# Bases de datos vectoriales

## Presentación

Problemente ya hayas oido hablar de las bases de datos vectoriales, o incluso estés trasteando con alguna. 

Qué son?

Las bases de datos vectoriales son aquellas que almacenan representaciones vectoriales de datos (embeddings).

Diferencia con las clásicas

Lo que las hace diferentes a las de tipo relacional, ya que, en lugar de guardar directamente los datos (numéricos, texto, boolenaos, fecha y hora y binarios) en tablas, los transforman y almancenan como vectores, que no son otra cosa que listas de números de longitud fija.

Y si la forma de guardar los datos es distinta, la forma cosultarlos también los es. Las relacionales lo hacen a través de búsqueda exacta pero las vectoriales usan la busqueda por similitud.

Propósito

Y es aquí dónde radica la importancia que las vectoriales están adquiriendo, ya que la similitud permite dotar de semántica a los datos, lo que las convierte en fuentes documentales óptimas para los LLMs. Realmente su desarrollo ha sido parejo y la forma en que se trnasforman datos en vectores es através de modelos de lenguaje desarrollados adhoc para esta tarea.












 Si las bases de datos relacionales almacenan datos (numéricos, texto, boolenaos, fecha y hora y binarios) en tablas relacionadas entre sí, las vectoriales transforman los datos en vectores

## Qué son? (diferencia con las clásicas)

Un vectorstore (almacén de vectores) es una base de datos optimizada para almacenar, indexar y buscar representaciones vectoriales de datos, comúnmente llamadas embeddings. Es un componente clave en los sistemas que utilizan retrievers basados en embeddings, como los de Retrieval-Augmented Generation (RAG) en LLMs.

Más habituales: FAISS (Facebook AI Similarity Search), Milvus, Weaviate, Pinecone, ChromaDB y también Elasticsearch, si tiene la búsqueda de vectores habilitada.

Ideal para búsquedas semánticas, recomendadores, sistemas de clasificación de texto, visión por computadora, modelos de lenguaje, etc.

Es un sistema optimizado para almacenar y recuperar vectores de alta dimensión mediante búsquedas por similitud.

A diferencia de bases de datos relacionales, que buscan coincidencias exactas, estas permiten encontrar resultados similares basándose en métricas como la distancia coseno, euclidiana o producto escalar.
Son fundamentales en sistemas RAG, motores de búsqueda semánticos, chatbots y recomendación de contenido.

datos structurados vs. embeddings vectoriales
búsquedas exactas, filtros en columnas y relaciones entre tablas vs. ANN (Approximate Nearest Neighbor)
tablas vs. vectores de alta dimensión

| Característica       | Base de datos tradicional | Base de datos vectorial                        |
|----------------------|---------------------------|------------------------------------------------|
| Tipo de datos        | Estructurados (tablas, columnas) | Vectores de alta dimensión                      |
| Consultas            | Exactas, basadas en SQL   | Similitud, búsqueda de vecinos cercanos        |
| Índices              | B-tree, hash indexes      | HNSW, IVF, Annoy                               |
| Escalabilidad        | Relacional, transacciones ACID | Búsquedas aproximadas rápidas en grandes volúmenes |
| Casos de uso         | Gestión de datos estructurados | Búsquedas semánticas, IA, ML, Recomendación    |
| Ejemplos             | MySQL, PostgreSQL, SQL Server | ChromaDB, Pinecone, FAISS, Qdrant              |

### Índices invertidos

Un índice invertido es una estructura de datos que almacena un mapeo de términos (palabras) a los documentos en los que aparecen.

| Token           | ID de documento      |
| --------------- | -------------------- |
| London          | 1,3,8,12,23,88       |
| Paris           | 1,12,88              |
| Madrid          | 3,8,12               |
| Berlin          | 12,23                |

## Propósito



## Esquema

1. División del texto (chunks).
2. Generación de embeddings: Un modelo de embeddings (por ejemplo, OpenAI Ada, Sentence Transformers, o Cohere) convierte documentos, frases o palabras en vectores de alta dimensión.
3. Almacenamiento: Estos embeddings se guardan en el vectorstore junto con metadatos opcionales.
4. Indexación: Se organizan de manera eficiente usando estructuras como Árboles K-D, HNSW (Hierarchical Navigable Small World) o PQ (Product Quantization) para búsquedas rápidas.
5. Búsqueda de similitud: Cuando se realiza una consulta, se convierte en un embedding y se comparan los vectores almacenados usando métricas como cosine similarity, dot product o Euclidean distance para encontrar los más relevantes.
6. Devolución de resultados: Se retornan los documentos más similares para su uso en generación de respuestas o análisis.

### 1. División del texto (chunks).

#### Razones

1️⃣ Longitud máxima del modelo de embeddings
Los modelos que convierten texto en vectores tienen un límite de tokens.
Ejemplo: all-MiniLM-L6-v2 de Sentence Transformers solo admite 256 tokens por entrada.
Si el texto es más largo, el modelo truncará la entrada, perdiendo información.

2️⃣ Mejor precisión en la recuperación
Si almacenamos textos largos como un solo embedding, las búsquedas pueden ser menos precisas.
Si una consulta busca información específica en un párrafo dentro de un documento largo, el resultado puede ser irrelevante si el embedding representa todo el documento.

3️⃣ Mejor rendimiento en la búsqueda
Si almacenamos documentos completos en una base de datos vectorial, los cálculos de similitud pueden ser más costosos y lentos.
Fragmentos más pequeños hacen que la búsqueda y el ranking sean más eficientes.

### 2. Embeddings

Los embeddings son representaciones numéricas de datos (palabras, frases, imágenes, etc.) en un espacio vectorial. Se utilizan para capturar significado semántico y medir similitudes entre elementos.

En el contexto del procesamiento de lenguaje natural (NLP), los embeddings convierten texto en vectores de números para que los modelos puedan procesarlo matemáticamente.

Los embeddings transforman palabras o frases en vectores de alta dimensión donde términos con significados similares tienen coordenadas cercanas.

Por ejemplo, en un espacio vectorial:

✅ "Rey" y "Reina" estarán más cerca entre sí.
✅ "Perro" y "Gato" también estarán más cerca.
❌ "Rey" y "Manzana" estarán más alejados.

Ejemplo de representación en 3 dimensiones (simplificada):

| Palabra | Dim 1 | Dim 2 | Dim 3 |
| ------- | ----- | ----- | ----- |
| Rey     | 0.5   | 0.8   | 0.2   |
| Reina   | 0.6   | 0.7   | 0.3   |
| Perro   | 0.9   | 0.1   | 0.4   |
| Gato    | 0.85  | 0.15  | 0.45  |

Los modelos encuentran la similitud entre embeddings con métricas como:

[Distancia coseno](https://es.wikipedia.org/wiki/Similitud_coseno) (la más usada en NLP).
[Distancia euclidiana](https://es.wikipedia.org/wiki/Distancia_euclidiana).
[Producto escalar](https://es.wikipedia.org/wiki/Producto_escalar).

Tipos de Embeddings y Usos

| Tipo de Embedding         | Ejemplo de Modelo                | Uso Principal                                        |
| ------------------------- | -------------------------------- | ---------------------------------------------------- |
| Word Embeddings           | Word2Vec, GloVe, FastText        | Captura significado de palabras individuales         |
| Contextualized Embeddings | BERT, RoBERTa, GPT-4             | Captura significado de palabras según el contexto    |
| Sentence Embeddings       | SBERT, OpenAI Embeddings, Cohere | Búsqueda semántica, RAG, recomendación de documentos |

Importante: SIEMPRE usa el mismo modelo para generar embeddings de documentos y realizar consultas ya que diferentes modelos generan diferentes vectores para la misma oración. Esto ocurre por varios factores: Diferencias en el entrenamiento, Variaciones en la dimensionalidad y Representación contextual captar matices más sutiles

#### metadatos

📌 ¿Qué son los metadatos?
Los metadatos son información adicional que describe o proporciona contexto sobre los datos principales (en este caso, los embeddings o los documentos que has almacenado en la base de datos vectorial). En el contexto de bases de datos vectoriales y búsqueda semántica, los metadatos permiten enriquecer y filtrar los resultados de búsqueda más allá de la similitud de los vectores.

Los metadatos también ayudan a organizar y estructurar la base de datos, permitiendo búsquedas más eficientes y flexibles.

Filtrar resultados por fecha, agrupar resultados en base a categorías o clasificar documentos según los metadatos. Los metadatos también son útiles para llevar un registro histórico de cuándo y cómo se actualizaron los documentos, permitiendo recuperar versiones anteriores si es necesario.

En resumen, los metadatos son datos sobre los datos.

Ejemplos de metadatos:
ID del documento: Un identificador único para cada documento.
Categoría: Por ejemplo, tecnología, salud, ciencia.
Fecha de creación: Fecha en la que se creó el documento.
Autor: Información sobre el autor del documento.
Fuente: De dónde proviene el documento (URL, base de datos, etc.).

### 4. Indexación

La indexación es el proceso de organizar los embeddings para hacer búsquedas más rápidas y eficientes.

Sin indexación → La búsqueda es una comparación directa con todos los vectores (brute-force), lo que puede ser lento.
Con indexación → Se usa una estructura optimizada para reducir el número de comparaciones necesarias.



Algunas bases de datos vectoriales hacen la indexación de forma automática al insertar los embeddings.

✅ Ejemplos:

ChromaDB → No necesitas preocuparte por la indexación, lo maneja internamente.
Pinecone → Optimiza automáticamente según el tamaño de los datos.
Weaviate y Qdrant → Indexan los embeddings al insertarlos.
📌 Si usas estas bases, no necesitas desarrollar la indexación manualmente.

### 4. almacenamiento

### 5. Búsqueda

se hace a través de un retriever que transforma la consulta en un vector

#### Chroma

🔹 Configuraciones que pueden afectar la búsqueda
1️⃣ Ajustar el número de resultados (n_results)
Si no obtienes buenos resultados, prueba con diferentes valores de n_results.

```py
results = collection.query(query_embeddings=query_embedding, n_results=10)  # Más resultados
```

2️⃣ Filtrar por metadatos (búsqueda híbrida)

Si guardaste metadatos en ChromaDB, puedes filtrar los resultados.

```py
results = collection.query(
    query_embeddings=query_embedding,
    n_results=3,
    where={"categoria": "tecnología"}  # Solo documentos de esta categoría
)
```

3️⃣ Usar búsqueda híbrida (texto + vectores)

Si la búsqueda solo con embeddings no es suficiente, puedes combinarla con búsqueda de texto tradicional.

```py
results = collection.query(
    query_texts=["inteligencia artificial en educación"],  # Búsqueda por texto
    query_embeddings=query_embedding,  # Búsqueda por vector
    n_results=5
)
```

📌 Esto mejora la precisión combinando texto y similitud semántica.

### 6 devolución de resultados 


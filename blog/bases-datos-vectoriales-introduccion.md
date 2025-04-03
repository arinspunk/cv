# Introducción a las bases de datos vectoriales: ¡datos, más datos!

*Publicado el 5 de marzo de 2025*

🦑 You can read this post in [english](../en/blog/vector-stores-introduction.html).

![Johnny nº5 leyendo un libro](https://xulioze.com/img/vectorstores-johnny-5-input.webp)

Llevo ya unos días desarrollando con mi colega Olivier un proyecto de IA. Nuestra idea es crear una herramienta que permita automatizar tareas de documentación, refactorización y escritura de tests para el código de un repositorio. A día de hoy, no tenemos claro si desde el punto de vista operativo merece la pena el esfuerzo, principalmente porque estamos viendo que existen servicios desarrollados específicamente para esto, como [Cursor](https://www.cursor.com/) o [Pythagora](https://www.pythagora.ai/). Sin embargo, lo que sí es seguro es que estamos aprendiendo mucho, además de perder algunas horas de sueño… 😴

Cuando nos acercamos por primera vez a una tecnología, lo habitual es sentirnos arrastrados por un torrente de nuevos conceptos y herramientas. En el caso del desarrollo de software con IA, la inundación inicial nos trae términos como LLMs, bases de datos vectoriales, retrievers, RAGs, agentes de IA, sentence transformers, etc.

En este post voy a centrarme en las bases de datos vectoriales (el título no engaña). Por ser una de las piezas fundamentales en en este ámbito y también por eso de que la mejor manera de comprender un concepto es ser capaz de explicarlo de manera sencilla. Si a ti también te ayuda, significará que no las he entendido mal del todo. 😊

## Vectores

Para entender qué son y cómo funcionan las bases de datos vectoriales, primero debemos saber qué es un vector.

En el ámbito del aprendizaje automático, un vector es una lista ordenada de números que representa datos de cualquier tipo, incluso no estructurados, como documentos de texto, imágenes, audios o vídeos.

La cantidad de números que componen un vector se conoce como dimensión, y las bases de datos vectoriales manejan vectores de varios cientos de dimensiones. Por ejemplo, el modelo [`text-embedding-3-small`](https://platform.openai.com/docs/guides/embeddings#how-to-get-embeddings) de OpenAI genera vectores de 1536 dimensiones.

1536 dimensiones conforman una lista de números muy grande. Si colocáramos uno aquí, lo más seguro es que abandonaras el post aburrido de hacer scroll. Así que, para un ejemplo más manejable, podemos mostrar la representación vectorial en 3 dimensiones de la palabra "amor":

```
[ 0.1234, -0.2567, 0.5432 ]
```

## Embeddings

Ahora que tenemos más claro lo que son los vectores, toca conocer cómo se almacenan en una base de datos vectorial. La forma de hacerlo es incrustándolos como puntos en un espacio multidimensional.

El número de dimensiones del espacio viene dado por la dimensionalidad de los vectores guardados. A mí, imaginar puntos distribuidos en 768, 1536 o 3072 dimensiones me resulta un poco complicado. Aunque quizás tú hayas visto *Interstellar* n veces y te sientas capaz de hacerlo. 😅

Si no es el caso, volvamos a nuestro ejemplo anterior. Como hemos representado "amor" con un vector de solo 3 dimensiones, este se dispondrá junto al resto de embeddings como un punto en un eje de coordenadas XYZ. Así es más fácil de visualizar, ¿verdad?

![embeddings en un espacio multidimensional](https://xulioze.com/img/vectorstores-embeddings.png)

## Consultas

Ahora que sabemos cómo se almacenan los datos en una base de datos vectorial, veamos cómo se realizan las consultas.

En primer lugar, la consulta se convierte en un embedding que puede ser comparado con el resto de vectores de la base de datos.

Dado que los embeddings son representaciones numéricas, es posible medir la distancia entre ellos utilizando distintas métricas matemáticas, entre las más comunes:

- Distancia euclidiana ( √Σ(xᵢ - yᵢ)² ): mide la distancia geométrica en un espacio multidimensional.
- Similitud del coseno ( cosθ ): mide el ángulo entre dos vectores, indicando cuán similares son en dirección.
- Distancia de Manhattan ( Σ |xᵢ - yᵢ| ): calcula la suma de las diferencias absolutas entre cada coordenada.

Las bases de datos vectoriales emplean algoritmos como `k-NN` (k-Nearest Neighbors) y `ANN` (Approximate Nearest Neighbors) que utilizan esta métricas para devolver los vectores más cercanos al de la consulta.

Esta forma de trabajar permite realizar búsquedas eficientes en grandes volúmenes de datos, ya que no es necesario analizar el contenido interno de cada vector, basta simplemente con comparar sus posiciones dentro del espacio multidimensional.

Aunque la eficiencia en las consultas es muy importante, la característica fundamental de las bases de datos vectoriales es su capacidad para encontrar los vectores más cercanos a la consulta, proceso conocido como búsqueda por similitud.

## Importancia de la búsqueda por similitud

Pero, ¿por qué es tan importante la búsqueda por similitud? Para entenderlo bien, tenemos que volver al punto inicial: la transformación de los datos en vectores, también conocida como embedding.

Quien se encarga de generar los embeddings no es la propia base de datos, sino un modelo de lenguaje especializado, llamado modelo de embedding. Estos modelos no hacen una simple traducción numérica de los datos, sino que encapsulan su semántica y contexto.

![embeddings próximos semánticamente](https://xulioze.com/img/vectorstores-semantic-similarity.png)

Y aquí es donde encontramos la clave para comprender la importancia de este tipo de búsqueda. Las búsquedas por similitud no solo identifican elementos cercanos en términos numéricos, sino que capturan similitudes semánticas, permitiendo a los LLMs reconocer relaciones profundas dentro de los datos almacenados.

En definitiva, las bases de datos vectoriales no solo facilitan el acceso a la información, sino que amplían la capacidad de los LLMs para interpretar y aprovechar el conocimiento disponible. ¡[Lo que hubiese dado Stephanie por tener una en 1986](https://www.youtube.com/watch?v=WnTKllDbu5o)!

# IA para developers. ¿Nos enamoramos o no?

Este no es un post especialmente meditado, son más bien unas notas breves sobre mi visión del estado del desarrollo de software con y para IA.

Con "con" me refiero a escribir código con la ayuda de la IA. Y con "para", a desarrollar software específico con IA integrada.

## Vías para desarrollar con/para IA

A día de hoy existen 5:

1. No usar IA
2. Chats
3. Asistentes de código
4. Asistentes de código con agentes IA
5. Desarrollo de agentes propios

### No usar IA

Entiendo esta postura, sobre todo si eres Senior y además estás un poco harto/a de toda la matraca que se está dando con el tema. Reconozco que [en la IA hay mucho de hype](https://www.wheresyoured.at/longcon/) (dale una oportunidad al artículo, siempre viene bien algo de viento entre tanto humo 😉), pero merece la pena usarla, aunque sólo sea para ahorrarte dar doscientas vueltas por [Stack Overflow](https://stackoverflow.com/) para solucionar un error que se te atasca o evitar tener que leerte toda la doc de una nueva API para desarrollar algo sencillo.

### Chats

[ChatGPT](https://chat.openai.com/), [DeepSeek](https://www.deepseek.com/), [Gemini](https://gemini.google.com/), [Claude](https://claude.ai/), etc.

Son el tipo de herramienta más usadas. Tanto por antigüedad como por accesibilidad, ya que todos los modelos tienen versiones gratuitas a través del navegador o App.

El tipo de interacción con la IA es conversacional: hacemos preguntas y obtenemos respuestas. Pero la desconexión del chat con nuestros archivos locales nos obliga a andar moviendo el código de un lado a otro.

En los chats, proporcionar el contexto adecuado es fundamental. Dado que su conocimiento es vastísimo, para obtener respuestas precisas sobre un lenguaje de programación específico, es necesario acotar y delimitar claramente el ámbito de la consulta. Para esto usamos prompts con:

- Rol
- Experiencia
- Staff técnico
- Técnicas de prompting como:
  - Chain-of-Thought
  - Knowledge Generation

Además los chats han evolucionado, incorporando la posibilidad de añadir contexto extra mediante la carga de archivos desde tu local o incluso directamente desde repositorios de GitHub, como en el caso de Claude.

### Asistentes de código

[GitHub Copilot](https://github.com/features/copilot), [Gemini Code Assist](https://developers.google.com/gemini-code-assist), [V0](https://v0.dev/), etc.

Su uso no está tan extendido. Por ser más recientes que los chats y porque sus versiones gratuitas sólo duran unos días de prueba. Aunque esta situación parece que está cambiando, por ejemplo, Google ofrece de forma gratuita su [Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/overview#supported-features-gca) para uso individual. 

Además de poder conversar con la IA, los asistentes ofrecen sugerencias de código sobre el archivo que estamos editando. Al contrario que los Chats, aquí no tenemos que andar copiando y pegando código.

Darle contexto no es tan importante. Su conocimiento está limitado al desarrollo de código y lee el archivo que tenemos abierto, lo que le permite conocer el lenguaje que estamos usando.

A la hora de realizar consultas se pueden añadir archivos o líneas específicas dentro de un archivo, pero los asistentes no tienen el contexto de todos los archivos de un proyecto.

### Asistentes de código con agentes IA

[Cursor](https://www.cursor.com/), [Pythagora.ai](https://pythagora.ai/), [CodeGPT](https://codegpt.com/), y próximamente [GitHub Copilot Agent Mode](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/).

Si tienes una licencia de GitHub Copilot y quieres probarlo, apúntate a [la lista de espera](https://github.com/github-copilot/workspace_waitlist_signup/). Quizás fue suerte pero a mí me dieron acceso en menos de 24h.

Además de la conversación y las sugerencias de código, este tipo de asistentes incluyen Agentes IA.

Mientras que para los asistentes de código tradicionales el contexto no era tan importante, con el uso de agentes vuelve a ser imprescindible, sobre todo si vamos a construir software desde cero. Así que nada de dejar de lado la [ingeniería de prompt](https://www.promptingguide.ai/es), ¡y menos mal porque considero que es una de las partes más divertidas del trabajo con IAs!

Al contrario que en los asistentes "tradicionales", los agentes sí tienen el contexto de todos los archivos de un proyecto, incluidas sus relaciones (como imports de funciones). Además, son capaces de:

- Crear y modificar archivos. Siempre pendiente de tu aprobación final
- Hacer uso de la terminal. Verlo las primeras veces da un poco de impresión 😅
- Crear ramas y hacer commits. Los mergeos quedan a cargo de un mamífero bípedo.
- Trabajar en paralelo contigo. Sí, puedes revisar el código de la conexión a una API mientras él desarrolla los 5 nuevos componentes que le has pedido 😳

### Desarrollo de agentes propios

Esta vía es la más diferente, ya que su verdadera función no es ayudarnos a desarrollar código, sino crear software con IA integrada. 

Existen varios frameworks (principalmente de Python) que facilitan el desarrollo del código, la creación de agentes y la integración de LLMs. Entre los más usados están [LlamaIndex](https://docs.llamaindex.ai/en/stable/) y [Crew AI](https://docs.crewai.com/introduction).

En teoría, podríamos desarrollar herramientas propias para la creación de código. Sin embargo, mi opinión es que, a menos que busques una solución muy específica, construir un agente de asistencia no compensa el esfuerzo. La razón es simple: requiere desarrollar múltiples componentes desde cero que en el caso de los Asistentes como Cursor o Pythagora ya vienen incluidos:
- Herramientas para leer el código de un repositorio
- RAG (Retrieval-Augmented Generation) para dar contexto al LLM:
  - Base de datos vectorial con el código del repositorio
  - Retrievers para hacer consultas a la base de datos y devolver resultados al LLM
- Agentes y tareas
- Herramientas para escribir código
- Otros componentes técnicos

Sin embargo, creo que la potencia de esta vía está en que podemos incorporar IA de forma relativamente sencilla en nuestro software y desarrollar herramientas IA propias sin depender de las ofrecidas (y cobradas) por terceros. Aunque por ahora no podemos librarnos completamente de pagar por las consultas a las APIs de los modelos que usemos en nuestros desarrollos. Una alternativa a las APIs, sobre todo si no necesitas gran profundidad de razonamiento, es usar [modelos en local](https://ollama.com/search), pero esa es una historia para abordar en otro post 😊

## Algunas reflexiones finales

Creo que el uso de los chats no va a desaparecer. Quedarse insatisfecho con la propuesta del asistente, preferir contrastar la respuesta con otros modelos, o aprender sobre un nuevo lenguaje mientras vas en el tren, son situaciones en las que recurrir a estas herramientas seguirá siendo una buena opción. Así que si ves a una persona haciendo preguntas a su móvil sobre Redux mientras coge un cartón de leche en el súper, dale una oportunidad, quizás no esté del todo loca y simplemente pretenda arrancar esa duda que se trajo clavada del trabajo usando la interfaz de voz de ChatGPT.

Creo que todos los asistentes de código van a acabar por incluir agentes y que se convertirán en el estándar de trabajo de cualquier desarrollador en no mucho tiempo.

Creo que merece la pena adentrarse en la creación de software con IA integrada. Porque comenzar es asequible, porque una parte importante de nuestra profesión se va orientar hacia ahí y porque está todo por hacer (¡toneladas de diversión!).

Entonces, ¿nos dejamos arrastrar por la locura generalizada y nos enamoramos o no? Bueno, si algo aprendimos de Theodore es que enamorarse de una IA no es un buen negocio, así que mejor probemos las nuevas herramientas con calma, aprendamos a usarlas y ya veremos en qué queda todo cuando desaparezca la pasión.
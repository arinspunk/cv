# Estado del desarrollo con (y para) IA

Este no es un post especialmente meditado, son más bien unas notas, con cierta estructuración, sobre mi visión del estado del desarrollo de software con y para IA.

Con "con" me refiero a escribir código con la ayuda de la IA. Y con "para", a desarrollar software específico con IA integrada.

## Vías para desarrollar con/para IA

A día de hoy existen 5:

1. No usar IA
2. Chats
3. Asistentes de código
4. Asistentes de código con agentes IA
5. Desarrollo de agentes propios

### No usar IA

Entiendo esta postura, sobre todo si eres un/una Senior y además estás un poco harto/a de toda la matraca que se está dando con el tema. Reconozco que en la IA hay mucho de hype, pero merece la pena usarla, aunque sólo sea para ahorrarte dar doscientas vueltas por [Stack Overflow](https://stackoverflow.com/) para solucionar un error que se te tasca o evitar tener que leerte toda la doc de una nueva API para desarrollar algo sencillo.

### Chats

[ChatGPT](https://chat.openai.com/), [DeepSeek](https://www.deepseek.com/), [Gemini](https://gemini.google.com/), [Claude](https://claude.ai/), etc.

Son el tipo de herramienta más usadas. Tanto por antigüedad como por accesibilidad, ya que todos los modelos tienen versiones gratuitas accesibles vía navegador o App.

El tipo de interacción con la IA es conversacional: preguntas y obtienes respuesta.

Al utilizar estas herramientas, proporcionar el contexto adecuado es fundamental. Dado que su conocimiento es vastísimo, para obtener respuestas precisas sobre un lenguaje de programación específico, es necesario acotar y delimitar claramente el ámbito de la consulta. Para esto usamos prompts con:

- Rol
- Experiencia
- Staff técnico
- Técnicas de prompting como:
  - Chain-of-Thought
  - Knowledge Generation

Además de prompts adecuados, todos los chats han ido incorporando la posibilidad de añadir contexto extra permitiendo la subida de archivos o incluso accediendo a repositorios de GitHub, como en el caso de Claude.

### Asistentes de código

[GitHub Copilot](https://github.com/features/copilot), [Gemini Code Assist](https://developers.google.com/gemini-code-assist), [V0](https://v0.dev/), etc.

Su uso no está tan extendido. Por ser más recientes que los chats y por disponer de versiones gratuitas que vayan más allá de unos días de prueba. Aunque esta situación parece que está cambiando, por ejemplo, Google ofrece de forma gratuita su [Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/overview#supported-features-gca) para uso individual. 

Además de poder conversar con la IA, los asistentes ofrecen sugerencias de código sobre el archivo que estamos editando.

Darle contexto no es tan importante ya que su conocimiento está limitado al desarrollo de código y lee el archivo que tenemos abierto.

En las consultas en el chat se permite añadir archivos o líneas específicas dentro de un archivo, pero no tienen contexto de todos los archivos de un proyecto.

### Asistentes de código con agentes IA

[Cursor](https://www.cursor.com/), [Pythagora.ai](https://pythagora.ai/), [CodeGPT](https://codegpt.com/), y próximamente [GitHub Copilot Agent Mode](https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/).

Si tienes una licencia de GitHub Copilot y quieres probarlo, apúntate a la lista de espera. Quizás fue suerte pero a mí me dieron acceso en menos de 24h.

Además de la conversación y las sugerencias de código, este tipo de asistentes incluyen Agentes IA.

Mientras que para los asistentes de código tradicionales el contexto no era tan importante, con el uso de agentes vuelve a ser imprescindible, sobre todo si vamos a construir software desde cero. Así que nada de dejar de lado la [ingeniería de prompt](https://www.promptingguide.ai/es), ¡y menos mal porque considero que es una de las partes más divertidas del trabajo con IAs!

Al contrario que en los asistentes normales, los agentes sí tienen el contexto de todos los archivos de un proyecto, incluidas sus relaciones (como imports de funciones). Además, son capaces de:

- Crear y modificar archivos 
- Hacer uso de la terminal
- Crear ramas y hacer commits
- Trabajar en paralelo contigo

### Desarrollo de agentes propios

Esta vía es un poco diferente a las otras, ya que su objetivo no es ayudarnos a desarrollar código, sino crear software con IA integrada. 

Para esto existen varios frameworks (principalmente de Python) que facilitan el desarrollo del código. Entre los más usados están [LlamaIndex](https://docs.llamaindex.ai/en/stable/) y [Crew AI](https://docs.crewai.com/introduction).

En teoría, podríamos desarrollar herramientas propias para la creación de código. Sin embargo, mi opinión es que, a menos que busques una solución muy específica, construir un agente de asistencia desde cero no compensa el esfuerzo. La razón es simple: requiere desarrollar múltiples componentes desde el principio que en el caso de los Asistentes con agentes ya están incluidos:
- Herramientas para leer el código de un repositorio
- RAG (Retrieval-Augmented Generation) para dar contexto al LLM:
  - Base de datos vectorial con el código del repositorio
  - Retrievers para hacer consultas a la base de datos y devolver resultados al LLM
- Agentes y tareas
- Herramientas para escribir código
- Otros componentes técnicos

Sin embargo, creo que la potencia de esta vía está en que podemos incorporar IA de forma relativamente sencilla en nuestro software y desarrollar herramientas IA propias sin depender de las ofrecidas (y cobradas) por terceros. Aunque por ahora no podemos librarnos completamente de pagar por las consultas a las APIs de los modelos que usemos en nuestros desarrollos. Una alternativa a las APIs, sobre todo si sólo necesitas razonamiento, es usar [modelos en local](https://ollama.com/search), pero esa es una historia para abordar en otro post 😊

## Reflexiones finales

Creo que el uso de los chats no va a desaparecer. Si no quedamos satisfechos con la propuesta del asistente, queremos contrastar la respuesta con otros modelos, o nos surge una duda y estamos lejos del ordenador, los chats siguen siendo útiles. Ya sabes, si ves a alguien haciendo preguntas a su móvil sobre Redux de React mientras compra leche, dale una oportunidad: quizás no esté loco, sino simplemente arrancar esa duda que se trajo clavada del trabajo usando la interfaz de voz de ChatGPT 😬

Creo que todos los asistentes de código van a acabar por incluir los agentes y que este tipo de herramientas se convertirá en el estándar de trabajo de cualquier desarrollador en no mucho tiempo.

## Conclusión

El desarrollo de software con y para IA está evolucionando rápidamente. Desde los chats simples hasta los asistentes con agentes inteligentes, las herramientas están transformando nuestra forma de programar. Como desarrolladores, tenemos la oportunidad de:
- Experimentar con nuevas tecnologías
- Aumentar nuestra productividad
- Explorar soluciones innovadoras

Aunque la IA aún no puede hornear pan o preparar pasteles, su potencial en el desarrollo de software es innegable. Lo más importante: aprender y experimentar con nuevas tecnologías siempre ha sido, y sigue siendo, muy divertido 🚀

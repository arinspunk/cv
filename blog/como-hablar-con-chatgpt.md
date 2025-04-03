# El arte de conversar con ChatGPT (y otros LLMs)

*Publicado el 30 de junio de 2023*

🦑 You can read this post in [english](../en/blog/how-talk-with-chatgpt.html).

🐙 Podes ler este post em [português](../pt/blogue/como-falar-com-chatgpt.html).

![Rachael y el Voight-Kampff test](../img/chatgpt-rachael.jpg)

En un intercambio de correos electrónicos sobre ChatGPT, un colega me preguntó cuál sería la mejor forma de escribir prompts al desarrollar código. Bueno, la respuesta no es simple, después de todo esto implica conversar con una red neuronal y muchas veces ya es difícil hacerlo con otras personas, cuanto más con una máquina. Sin embargo, como soy una persona muy educada y que siempre le gusta ayudar cuando es posible, reflexioné y respondí de la mejor manera que pude.

La red está llena [consejos](https://github.com/readme/guides/coding-generative-ai) para mejorar nuestros prompts y he incorporado muchos de ellos, pero al analizarlos individualmente, no sé qué grado de mejora han traído. Incluso hay algunos en los que no estoy seguro de si tuvieron un impacto significativo. Es normal, la experiencia que acumulo todavía no es suficiente para hacer estadística. Sin embargo, lo que puedo afirmar es que en conjunto y en comparación con mis toscas primeras pruebas, su incorporación ha resultado en una mejora innegable en los resultados obtenidos.

Un caso diferente son las estrategias enfocadas en la resolución de tareas más complejas, ya que a diferencia de las simples en las que podemos obtener una respuesta válida e incluso muy similar, usando o no un determinado consejo, la adopción de estas técnicas trae una mejora inmediata y evidente. [Sin una estrategia definida](https://xulioze.com/blog/construir-pwa-con-chatgpt.html), el LLM tendía a dispersarse y cometer errores, obligándome a corregirlo y guarlo con nuevas preguntas o instrucciones. Sin embargo, cuando incluí en mi trabajo el [Chain-of-Thought](https://www.promptingguide.ai/es/techniques/cot) y el [Generated Knowledge](https://www.promptingguide.ai/es/techniques/knowledge), estos problemas se resolvieron. (Tengo pendiente un artículo contando cómo desarrollé un blog en React con la ayuda de ChatGPT).

> "Understanding these capabilities are important to understand the limitations of these models and how to use them effectively."
>
> — *Prompt Engineering Guide*

Entonces, ¿cómo evaluamos los pequeños consejos que encontramos en la red? Un enfoque inicial (y obvio) es seguir las indicaciones de fuentes confiables. A mí me gusta mucho [learnprompting.org](https://learnprompting.org/) y [promptingguide.ai](https://www.promptingguide.ai/es), pero [hay muchas más](https://github.com/openai/openai-cookbook#prompting-guides). Otro, complementario, es determinar si el propósito de un consejo tiene sentido con el funcionamiento de los LLM. Es evidente que seguir este enfoque implica un gasto extra de tiempo, ya que:

1. Tenemos que determinar el propósito del consejo, aunque todos tiendan a buscar:
   - Reducir el [número de tokens](https://platform.openai.com/tokenizer) utilizados en las preguntas y respuestas.
   - Optimizar el trabajo del LLM en el procesamiento de las preguntas y en la generación de las respuestas.
   - Obtener la mejor respuesta posible para nuestra tarea.

2. Y nos obliga a profundizar en la [comprensión y el conocimiento de estas herramientas](https://www.promptingguide.ai/es/models).

Sin embargo, esta siempre es una buena inversión, ya que ayuda a mejorar nuestro trabajo diario y nos permite disfrutar del placer de aprender algo nuevo.

Finalmente mi colega, que también es muy educado, agradeció la respuesta. Pero como igualmente es pragmático y directo, quiso después saber si yo había identificado alguna buena práctica. Resumiendo, buscaba una lista de consejos 😬

## Mis consejos

Dejo aquí las prácticas que siempre incluyo en mis prompts orientados al desarrollo de tareas simples. Para aprender a escribir código complejo con ChatGPT, te recomiendo comenzar por el artículo "[An example of LLM prompting for programming](https://martinfowler.com/articles/2023-chatgpt-xu-hao.html)".

- Evito la formalidad. Nada de "Buenos días", "podría usted…", "muchas gracias", etc. No te preocupes, el LLM no es un ser consciente y siempre es bueno ahorrar algunos tokens.
- Siempre empiezo con un "As a [rol name]". Con esto busco formatear la respuesta del modelo de una manera más específica.
- Incluyo detalles con terminología especializada. La idea es proporcionar suficiente contexto para evitar que el modelo tenga que adivinar lo que quiero decir.
- Procuro ser lo más sintético posible, en equilibrio con el punto anterior. Cuanto más breve y directo sea nuestro prompt, más concisa será la respuesta, además de ahorrar algunos tokens.
- Limpio mis códigos de ejemplo. Todo lo que no es necesario para desarrollar la tarea solo agrega ruido y desperdicia tokens.

Lo que pretendía ser un borrador de un método para aprender a conversar con las máquinas se ha convertido en otro artículo con consejos para usar ChatGPT. ¿Crees que el propósito de cada uno tiene sentido con el funcionamiento de los LLMs?

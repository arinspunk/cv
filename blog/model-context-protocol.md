# Model Context Protocol: la nueva frontera en la comunicación con LLMs

*Publicado el 3 de abril de 2025*

🦑 You can read this post in [english](../en/blog/model-context-protocol.html).

![HAL 9000 con gafas de lectura](https://xulioze.com/img/mcp-hal-reading.webp)

Llevo algunas semanas sumergido en este mundillo de la IA generativa y, como ya comenté en mi [post anterior sobre desarrollo con IA](https://xulioze.com/blog/desarrollo-con-ia.html), hay momentos en los que la sensación de estar viviendo en una película de ciencia ficción es difícil de evitar. Entre todos los avances recientes, hay uno que me está pareciendo particularmente fascinante: el Model Context Protocol (MCP).

Si has trabajado con LLMs (ya sea Claude, GPT o Gemini), probablemente te hayas encontrado con ese problema tan típico: "¿cómo diablos le explico a esta IA exactamente lo que quiero?". Y es que hasta ahora, comunicarnos con estos modelos ha sido un poco como hablar con alguien que tiene muchísimos conocimientos pero que, a veces, parece no entender del todo nuestras intenciones. Aquí es donde entra en juego el MCP.

## ¿Qué es el Model Context Protocol?

En esencia, el Model Context Protocol es un estándar emergente que busca establecer un marco común para la comunicación entre humanos y modelos de lenguaje. Desarrollado inicialmente por Anthropic (los creadores de Claude) y ahora con respaldo de varias empresas del sector, el MCP proporciona una estructura y un conjunto de convenciones para organizar el contexto que enviamos a los LLMs.

¿Te suena familiar eso de estar cortando y pegando prompts, reorganizando instrucciones o buscando la forma perfecta de explicarle al modelo lo que quieres? El MCP viene a poner orden en este caos, separando claramente:

- Instrucciones y directrices para el modelo
- Contexto y documentos de referencia
- La consulta actual del usuario
- Metadata y configuración adicional

Si el concepto de prompting te resulta interesante, quizás quieras revisar [mi post sobre el arte de conversar con ChatGPT](https://xulioze.com/blog/como-hablar-con-chatgpt.html), donde ya exploraba algunas técnicas que ahora el MCP está formalizando.

## Estructura básica del MCP

Un mensaje típico usando MCP tendría esta estructura:

```
<context>
  <system>
    Aquí van las instrucciones para el modelo sobre cómo comportarse.
  </system>
  
  <user_attributes>
    Información sobre el usuario que puede ser relevante.
  </user_attributes>
  
  <documents>
    <document>
      <source>nombre_del_documento.md</source>
      <content>
        Contenido del documento para referencia.
      </content>
    </document>
  </documents>
</context>

<message>
  La consulta actual del usuario.
</message>
```

¿Notas algo familiar en este formato? Efectivamente, se parece mucho a XML, y no es casualidad. Esta estructura es intencionalmente similar a formatos que ya conocemos para facilitar su adopción y procesamiento.

## ¿Por qué es importante el MCP?

Cuando comencé a explorar las bases de datos vectoriales para [mi post introductorio sobre el tema](https://xulioze.com/blog/bases-datos-vectoriales-introduccion.html), una de las cosas que me llamó la atención fue cómo estas herramientas se conectaban con los LLMs. La comunicación era, en el mejor de los casos, un tanto artesanal.

Con MCP, esta interacción se vuelve mucho más estructurada, ofreciendo varias ventajas:

1. **Interoperabilidad**: Un mismo prompt puede funcionar en diferentes modelos, reduciendo el "vendor lock-in".
2. **Claridad**: Separa nítidamente instrucciones, contexto y la consulta actual.
3. **Eficiencia**: Permite a los modelos procesar mejor la información, evitando confusiones.
4. **Estandarización**: Ofrece un lenguaje común para herramientas y frameworks que trabajan con LLMs.

Para los desarrolladores, esto significa menos tiempo ajustando prompts específicos para cada modelo y más concentración en crear aplicaciones realmente útiles.

## MCP en la práctica

Veamos un ejemplo práctico. Supongamos que estamos desarrollando una aplicación que, al igual que [mi experimento con ChatGPT y PWAs](https://xulioze.com/blog/construir-pwa-con-chatgpt.html), necesita consultar datos meteorológicos y presentarlos de forma amigable.

Sin MCP, nuestro prompt podría ser algo así:

```
Eres un asistente especializado en meteorología. Analiza estos datos 
meteorológicos de Madrid: temperatura 25°C, humedad 45%, viento 10km/h 
del suroeste. Necesito que me des un resumen en lenguaje coloquial para
un niño de 8 años, explicando si es un buen día para jugar en el parque.
```

Con MCP, tendríamos:

```
<context>
  <system>
    Tu rol es ser un meteorólogo amigable que explica conceptos a niños.
    Usa lenguaje sencillo, analogías y mantén un tono alegre y educativo.
    No uses términos técnicos sin explicarlos.
  </system>
  
  <documents>
    <document>
      <source>madrid_weather.json</source>
      <content>
        {
          "location": "Madrid, España",
          "temperature": 25,
          "humidity": 45,
          "wind": {
            "speed": 10,
            "direction": "suroeste"
          },
          "uv_index": 6,
          "forecast": "soleado"
        }
      </content>
    </document>
  </documents>
</context>

<message>
  ¿Es un buen día para que mi hijo de 8 años juegue en el parque?
</message>
```

La diferencia es sustancial. En el segundo caso, hemos separado claramente:
- Las instrucciones sobre cómo debe comportarse el modelo
- Los datos meteorológicos como un documento estructurado
- La pregunta específica del usuario

Esto no solo hace que sea más fácil para el modelo entender lo que queremos, sino que también simplifica la actualización de cualquiera de estas partes individualmente.

## Integración con bases de datos vectoriales

Una de las aplicaciones más prometedoras del MCP está en la integración con bases de datos vectoriales, tema que abordé en [mi post sobre vectorstores](https://xulioze.com/blog/bases-datos-vectoriales-introduccion.html).

Cuando trabajamos con RAG (Retrieval-Augmented Generation), necesitamos pasar al modelo:
1. Los chunks de texto recuperados de nuestra base de datos
2. Instrucciones sobre cómo usar esa información
3. La pregunta del usuario

MCP ofrece una estructura perfecta para esto:

```
<context>
  <system>
    Eres un asistente de documentación técnica. Tu tarea es responder preguntas 
    basándote exclusivamente en los documentos proporcionados. Si la información 
    no está en los documentos, debes indicarlo claramente.
  </system>
  
  <documents>
    <document>
      <source>api_docs.md</source>
      <content>
        # API de Pagos
        La autenticación utiliza OAuth 2.0 y requiere los siguientes parámetros...
      </content>
    </document>
    <document>
      <source>troubleshooting.md</source>
      <content>
        ## Errores comunes
        El error 403 suele indicar un problema con los permisos de la API key...
      </content>
    </document>
  </documents>
</context>

<message>
  ¿Cómo soluciono un error 403 en la API de pagos?
</message>
```

Esta estructura no solo facilita la implementación de sistemas RAG, sino que también mejora su rendimiento al dejar claro al modelo qué información debe priorizar.

## El futuro del MCP

Al igual que cuando exploré [el desarrollo con IA](https://xulioze.com/blog/desarrollo-con-ia.html), me encuentro con que estamos en los primeros pasos de algo que parece tener un recorrido muy interesante. El MCP es todavía un estándar en evolución, pero su adopción está creciendo rápidamente.

Empresas como Anthropic, Cohere y varias startups del ecosistema LLM ya están implementando soporte para MCP en sus APIs y herramientas. Los frameworks populares para trabajar con LLMs, como LangChain y LlamaIndex, también están incorporando soporte para este protocolo.

Personalmente, creo que veremos el MCP convertirse en un estándar de facto en los próximos meses, especialmente a medida que más desarrolladores descubran sus beneficios para la consistencia y portabilidad de sus aplicaciones basadas en IA.

## Conclusiones

El Model Context Protocol representa un paso importante hacia la madurez de las herramientas de IA generativa. Al establecer convenciones claras para la comunicación con LLMs, nos acercamos a un ecosistema más estructurado, predecible y fácil de usar.

Para los desarrolladores como tú y yo, que estamos explorando este territorio relativamente nuevo, el MCP ofrece una forma de organizar nuestro trabajo que reduce la fricción y nos permite centrarnos en lo que realmente importa: crear aplicaciones útiles y experiencias significativas.

¿Has probado ya a implementar MCP en alguno de tus proyectos? ¿O quizás tienes dudas sobre cómo podría encajar en tu stack actual? Me encantaría conocer tu experiencia y perspectiva.

Hasta la próxima, ¡y que la IA te acompañe! 🚀
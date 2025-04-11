# Cómo construir una PWA con ChatGPT antes de que nos mande al paro

*Publicado el 14 de abril de 2023*

🦑 You can read this post in [english](../en/blog/build-pwa-with-chatgpt.html).

🐙 Podes ler este post em [português](../pt/blogue/construir-pwa-com-chatgpt.html).

![David Bowman delante de HAL 9000](../img/chatgpt-hal-9000.jpg)

> Cualquier tecnología lo suficientemente avanzada es indistinguible de la magia.
>
> — *Arthur C. Clarke*

La primera IA que utilicé (conscientemente) fue [Midjourney](https://www.midjourney.com/): escribir un prompt, presionar enter, esperar un instante y la imagen aparecía de la nada. Bonita, sofisticada y extraña. Fue como presenciar un acto mágico.

Luego probé [Dall·E](https://openai.com/research/dall-e) y [Stable Diffusion](https://stablediffusionweb.com/), igualmente espectaculares, pero al final el aburrimiento venció a la magia. No encontré utilidad para mí, prefiero [generar imágenes a mi manera](https://twitter.com/naia_ze/status/1621621795907420162).

Los meses pasaron y se dejó de hablar tanto sobre ellas, había un nuevo juguete, [ChatGPT](https://stablediffusionweb.com/).

Tardé en usarlo, pero la semana pasada copié un snippet de JavaScript de un sitio antiguo, lo pegué en el cuadro de chat y pregunté: "¿Podrías optimizar este fragmento de código?" Y el texto fue creciendo mientras decía, claro, puedes mejorar esto con aquello, y aquello con esto, etc. Te dejo un ejemplo. El ejemplo tenía sentido y funcionaba. De nuevo un acto aparentemente mágico. De nuevo la emoción. Pero ahora también una sensación diferente, un poco de miedo.

![está despedido](../../img/fired.gif)

Solo un poquito. La verdad es que no creo en la magia (excepto en la de [Tamariz](https://www.nytimes.com/2023/01/02/magazine/juan-tamariz-magic.html)), ya vi gastar el adjetivo disruptivo en la primera década del siglo y como la mejor manera de perder el miedo a algo es conocerlo, me puse manos a la obra, antes de que nos enviara derechasal paro.

## Experimento

Hmm… ¿Por dónde empezar? Bueno, [Naia y yo](https://twitter.com/naia_ze) tenemos la idea de crear una aplicación meteorológica en la que, en lugar de los clásicos iconos, se muestren unos dibujos un poco más divertidos. Así que aprovechando la excusa, escribí la siguiente pregunta:

![primera pregunta a ChatGPT y su respuesta](../../img/chatgpt-01.jpg)

Perfecto. En su primera respuesta, ChatGPT proporcionó un HTML, un fragmento de JS y una explicación detallada de todo el código.

Reemplacé `your_openweathermap_api_key_here` por una clave válida de la API OpenWeatherMap y funcionó. El único error reseñable fue la temperatura de la ciudad, ya que indicaba que estaba en grados Celsius, pero en realidad el valor estaba en Kelvin.

[Ver en CodePen: chatGPT 01](https://codepen.io/arinspunk/pen/GRYpLrL)

Después de algunas pruebas más, noté que si el nombre de la ciudad no existía en la base de datos de la API, por ejemplo Portox, obtenía un error en el fetch (con el mensaje que pasábamos en el código, "Failed to fetch weather data for Portox"). También ocurría que si varias ciudades compartían el mismo nombre, como Porto, que hay en Portugal, Brasil y España, los datos que veíamos pertenecían solo a una de ellas. Por lo que escribí una segunda pregunta:

![segunda pregunta a ChatGPT y su respuesta](../../img/chatgpt-02.jpg)

Esta vez ChatGPT no acertó. O mejor dicho, acertó pero yo no le proporcioné la pregunta correcta. Simplemente verificaba si la ciudad existía en la base de datos antes de buscar la información meteorológica. Sin embargo, para el usuario no había diferencia en comparación con la versión anterior, excepto por el intercambio de mensajes. Además, el problema de las ciudades con el mismo nombre no se resolvía.

[Ver en CodePen: PWA com ChatGPT 02](https://codepen.io/arinspunk/pen/qBJOzJX)

Mea culpa y nueva pregunta. Ahora enfocada en las ciudades con el mismo nombre:

![tercera pregunta a ChatGPT y su respuesta](../../img/chatgpt-03.jpg)

Con el nuevo código se mostraba la lista de ciudades, pero no era posible hacer clic en ellas para obtener los datos de solo una al presionar el botón "Buscar".

[Ver en CodePen: PWA com ChatGPT 02](https://codepen.io/arinspunk/pen/oNajrao)

Otra pregunta más:

![cuarta pregunta a ChatGPT y su respuesta](../../img/chatgpt-04.jpg)

Con el cambio, sí era posible hacer clic en una de las ciudades de la lista y, al hacerlo, se obtenían los datos meteorológicos de esa ciudad.

[Ver en CodePen: PWA com ChatGPT 04](https://codepen.io/arinspunk/pen/abRpbjQ)

Pero aún quedaban algunos puntos por pulir:

- El botón "Buscar" realmente no servía para nada.
- La lista debería desaparecer al hacer clic en una de las opciones.
- Había que cambiar la temperatura a Celsius.
- Sería bueno indicar el nombre del país a la derecha de cada ciudad.

Fue en este punto donde decidí dejar el piloto automático y pasar al "modo manual", ya que creí que sería más rápido modificar el código yo mismo que seguir preguntando.

Aquí está el resultado con las "modificaciones humanas":

[Ver en CodePen: PWA com ChatGPT 05](https://codepen.io/arinspunk/pen/wvYgBdP)

Ahora que el código estaba listo, era hora de convertir nuestro sitio en una PWA (aplicación web progresiva):

![quinta pregunta a ChatGPT y su respuesta](../../img/chatgpt-05.jpg)

En el primer intento funcionó 🥳

Este es el resultado: [Pe Man](https://xulioze.com/test/pwa/)

¡Muchas gracias ChatGPT!

![última pergunta a ChatGPT e a sua resposta](../../img/chatgpt-06.jpg)

## Conclusiones

La primera conclusión es que ChatGPT es capaz de comprender muy bien incluso un inglés malo como el mío 😬

La segunda es que puede ser útil para:

- Escribir un código base, ayudándonos a ahorrar tiempo. Después de analizar mi experimento, debo constatar que la mejor estrategia es escribir un prompt lo más amplio y contextualizado posible, en lugar de formular muchas preguntas cortas.
- Hacer mejoras/cambios en el código. Hasta cierto punto, luego es mejor pasar al modo manual/humano.
- Realizar consultas a una API que no conocemos sin necesidad de visitar su documentación.
- Optimizar el código.
- Ampliar el conocimiento sobre un lenguaje, conociendo otros enfoques.
- Iniciarse en nuevos lenguajes/tecnologías.

Y la última y más importante, es que no nos va a enviar a las programadoras directamenteal paro. Al menos en los próximos meses…

🥹

![Estás despedido](../../img/fired.gif)

import { siteConfig } from "@/config/site";
import Hyperlink from "@/components/Hyperlink";
export const metadata = {
  title: 'Colophon',
}

export default function Colophon() {
  return (
    <>
      <h1>Colophon</h1>

      <h2>ShareWaste</h2>
      <p>
        ShareWaste was a precursor to Peels with a similar idea: connecting people locally to divert organic material from landfill. We’re doing our best to continue the mission, in our own way.
      </p>

      <h2>Technology</h2>
      <p>Peels is made possible thanks the free and open source software described below. We’ve also made Peels <Hyperlink href={`${siteConfig.repoUrl}?tab=readme-ov-file#forking-peels`} target="_blank">open source</Hyperlink> to pay it forward and hopefully inspire similar circular economy projects.</p>
      <h3>Maps</h3>
      <p>
        <Hyperlink href="https://www.mapbox.com/" target="_blank">Protomaps</Hyperlink> generously provides both the map tiles for Peels and a hosted API. We’re rendering those map tiles using <Hyperlink href="https://visgl.github.io/react-map-gl/">React Map GL</Hyperlink> and <Hyperlink href="https://github.com/maplibre/maplibre-gl-js">Maplibre GL JS</Hyperlink>.
      </p>

      <h3>Components</h3>
      <p>
        Peels relies on a few ‘headless’ React components under the hood, namely <Hyperlink href="https://headlessui.com/">HeadlessUI</Hyperlink> and <Hyperlink href="https://www.radix-ui.com/primitives">Radix UI</Hyperlink>. They provide a solid foundation for accessibility (and helped get us off the ground quickly).
      </p>
      <p>
        We don’t really use any custom components beyond the aforementioned primitive, headless, ones. The one major exception is the map drawer. That’s built on top of Emil Kowalski’s buttery-smooth <Hyperlink href="https://vaul.emilkowal.ski/">Vaul</Hyperlink> drawer component.
      </p>

      <h3>Icons</h3>
      <p>
        Some icons are derived from the <Hyperlink href="https://lucide.dev/" target="_blank">Lucide</Hyperlink> and <Hyperlink href="https://heroicons.com/" target="_blank">Hero Icons</Hyperlink> libraries. The rest have been drawn manually.
      </p>

      <h3>Everything else</h3>
      <p>Peels benefits from a whole heap of other open source libraries as noted on our <Hyperlink href={`${siteConfig.repoUrl}/blob/main/package.json`} target="_blank">GitHub repository</Hyperlink>.</p>
    </>
  );
}

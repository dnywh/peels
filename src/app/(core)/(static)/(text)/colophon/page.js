import { siteConfig } from "@/config/site";
import Hyperlink from "@/components/Hyperlink";
export const metadata = {
  title: 'Colophon',
}

export default function Colophon() {
  return (
    <>
      <h1>Colophon</h1>
      <p>Peels is built upon some great concepts, technology, and tooling, with some highlights mentioned below.</p>

      <h2>Technology</h2>
      <p>Peels is made possible thanks to the free and open source software described below. Check out our <Hyperlink href={`${siteConfig.repoUrl}/blob/main/package.json`} target="_blank">GitHub repository</Hyperlink> for a full list of open source technologies used.</p>

      <p>We’ve made Peels similarly <Hyperlink href={`${siteConfig.repoUrl}?tab=readme-ov-file#forking-peels`} target="_blank">open source</Hyperlink> to pay it forward and perhaps inspire other circular economy projects.</p>

      <h3>Maps</h3>
      <p>
        <Hyperlink href="http://protomaps.com" target="_blank">Protomaps</Hyperlink> generously provides both the map tiles for Peels and a hosted API. We’re rendering those map tiles using <Hyperlink href="https://visgl.github.io/react-map-gl/" target="_blank">React Map GL</Hyperlink> and <Hyperlink href="https://github.com/maplibre/maplibre-gl-js" target="_blank">Maplibre GL JS</Hyperlink>.
      </p>

      <h3>Front-end</h3>
      <p>Peels is built on the open source React framework <Hyperlink href="http://protomaps.com" target="_blank">Next.js</Hyperlink>, and hosted on Vercel.</p>

      <h3>Back-end</h3>
      <p><Hyperlink href="http://supabase.com" target="_blank">Supabase</Hyperlink> powers all things authentication, database, and storage for Peels.</p>

      <h3>Components</h3>
      <p>
        Peels relies on a few ‘headless’ React components under the hood, namely <Hyperlink href="https://headlessui.com/" target="_blank">HeadlessUI</Hyperlink> and <Hyperlink href="https://www.radix-ui.com/primitives" target="_blank">Radix UI</Hyperlink>. They provide a solid foundation for accessibility (and helped get us off the ground quickly).
      </p>
      <p>
        We don’t really use any custom components beyond the aforementioned primitive, headless, ones. The one major exception is the map drawer, based on the <Hyperlink href="https://vaul.emilkowal.ski/" target="_blank">Vaul</Hyperlink> drawer component.
      </p>

      <h3>Icons</h3>
      <p>
        Some icons are derived from the <Hyperlink href="https://lucide.dev/" target="_blank">Lucide</Hyperlink> and <Hyperlink href="https://heroicons.com/" target="_blank">Hero Icons</Hyperlink> libraries. The rest have been drawn by hand.
      </p>

      <h2>Concepts</h2>
      <p>It’d be remiss of us not to mention prior work done by folks to pave the way for something like Peels to not only exist, but be instantly understood by regular people using it for the first time.</p>

      <h3>ShareWaste</h3>
      <p>
        ShareWaste was a precursor to Peels with a similar idea: connecting people locally to divert organic material from landfill. We’re doing our best to continue the mission, in our own way.
      </p>

      <h3>Mapping platforms</h3>
      <p>We take for granted how central mapping is to our everyday lives. Smart people developed interface paradigms (and satellites) that we use daily to find things in physical space around us.</p>

      <p>Peels is a beneficiary of this work. We all know what pins on a map means. We know what will likely happen when we tap one, and how to jump between pins or pan around the world.</p>

      <p><Hyperlink href="https://maphappenings.com" target="_blank">Map Happenings</Hyperlink> does a great job describing the history of mapping platforms, in case you’d like to learn more.</p>
    </>
  );
}

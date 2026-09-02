import { BlogPosts } from 'app/components/posts'
import ImageRotator from 'app/components/image-rotator'

export default function Page() {
  return (
    <section>
      <h1 className="mb-1 text-2xl font-semibold tracking-tighter">
        Subham
      </h1>

      {/* Image Rotator under the heading */}
      <div className="mb-8">
        <ImageRotator
          images={[
            { src: '/banners/x3.png', alt: 'Vibecoding' },
            { src: '/banners/first-cliff-walk.jpg', alt: 'Cliff walk at First, above Grindelwald' },
            { src: '/banners/paris-seine.jpg', alt: 'On the Seine at dusk with the Eiffel Tower behind' },
            { src: '/banners/lucerne-river.jpg', alt: 'The Reuss from the Chapel Bridge, Lucerne' },
            { src: '/banners/mountain-bike.jpg', alt: 'Mountain biking in the Alps' },
            { src: '/banners/chapel-bridge.jpg', alt: 'On the Chapel Bridge in Lucerne' },
            { src: '/banners/flower-market.jpg', alt: 'Flower market in Amsterdam' },
            { src: '/banners/eiffel-night.jpg', alt: 'Eiffel Tower at night from a Seine boat' },
            { src: '/banners/lucerne-village.jpg', alt: 'Lakeside village on Lake Lucerne' },
          ]}
          intervalMs={5000}
          width={1500}
          height={700}
        />
      </div>

      <p className="mb-4">
        {`Hi! I'm a software engineer, currently living in the Bay Area. I attend Northeastern University. I enjoy designing, building, and deploying scalable infrastructure. I enjoy building in Kotlin. Have an opinionated tech stack you want to chat about? Msg. me! This website will be occasionally updated with blog posts where I talk about things I am doing, working on, have failed at, or succeeded in.`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}

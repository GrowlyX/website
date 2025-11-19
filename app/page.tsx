import { BlogPosts } from 'app/components/posts'
import ImageRotator from 'app/components/image-rotator'
import ViewCounter from 'app/components/view-counter'
import SpotifyPlaying from 'app/components/spotify-playing'

export default function Page() {
  return (
    <section>
      <h1 className="mb-1 text-2xl font-semibold tracking-tighter">
        Subham
      </h1>
      <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
        <ViewCounter id="home" />
      </div>

      {/* Image Rotator under the heading */}
      <div className="mb-8">
        <ImageRotator
          images={[
            { src: '/banners/x1.jpg', alt: 'Self Portrait' },
            { src: '/banners/x2.png', alt: 'Interview' },
            { src: '/banners/x3.png', alt: 'Vibecoding' },
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
      <SpotifyPlaying />
    </section>
  )
}

import { BlogPosts } from 'app/components/posts'
import ImageRotator from 'app/components/image-rotator'

export default function Page() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold tracking-tighter">
        Subham
      </h1>

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
        {`I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
        Vim's keystroke commands and tabs' flexibility for personal viewing
        preferences. This extends to my support for static typing, where its
        early error detection ensures cleaner code, and my preference for dark
        mode, which eases long coding sessions by reducing eye strain.`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}

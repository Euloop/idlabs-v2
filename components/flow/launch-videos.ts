/* The launch videos, from the X posts (the 720p mp4 of each post's video, found through the
   fxtwitter API on 2026-11-11). Played straight from X's video server, which refuses requests that
   carry another site's referrer, so /home-2 sends none (its metadata: referrer no-referrer).
   Posts whose media is a photo (Airwallex, Lovable, Deel) have none: their slide shows the picture.
   To self-host later: download these into public/ and point the URLs there. */
export const LAUNCH_VIDEO: Record<string, string> = {
  'matic-robots-launch': 'https://video.twimg.com/amplify_video/2087962757044015104/vid/avc1/1280x720/9u6NpT8MCGwHOqUV.mp4?tag=14',
  'matic-robots-design-documentary': 'https://video.twimg.com/amplify_video/2089784320668086272/vid/avc1/1280x720/8IcsGtPJUXnYXpJr.mp4?tag=14',
  'pocket-fm-product-launch': 'https://video.twimg.com/amplify_video/2101019709311528960/vid/avc1/1280x720/8au0vZg1eYzqeIiA.mp4?tag=16',
  'fish-audio-seed-raise': 'https://video.twimg.com/amplify_video/2082150306587009024/vid/avc1/1280x720/S0rGejiC9vXEV5nG.mp4?tag=29',
  'gamma-100m-arr-announcement': 'https://video.twimg.com/amplify_video/1987871318721679360/vid/avc1/1280x720/iQx_SYC06yJsdnXH.mp4?tag=21',
  'wispr-flow-feature-release': 'https://video.twimg.com/amplify_video/2025975637392207872/vid/avc1/1280x720/a9AAhGGApCxv0XDT.mp4?tag=21',
  'cartesia-fundraise-model-launch': 'https://video.twimg.com/amplify_video/1983202156967858176/vid/avc1/1280x720/98Mdx-OcOzrs4n4x.mp4?tag=14',
  'polyai-product-demo': 'https://video.twimg.com/amplify_video/2023781188654022658/vid/avc1/1280x720/9ieCeWK3IucWADjR.mp4?tag=21',
  'playerzero': 'https://video.twimg.com/amplify_video/2036111282349473792/vid/avc1/1280x720/migQRakV88EnlMDK.mp4?tag=14',
};

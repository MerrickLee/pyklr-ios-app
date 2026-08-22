// Local entrypoint.
// Metro serves bundles relative to this project root (apps/mobile). Pointing
// "main" directly at "expo-router/entry" resolved through a pnpm symlink into
// <repo>/node_modules/.pnpm/..., which is two levels ABOVE this root, so Metro
// produced a bundle URL beginning with "/../../" that it could not serve.
// Re-exporting from a file that physically lives here keeps the URL in-root.
import 'expo-router/entry';

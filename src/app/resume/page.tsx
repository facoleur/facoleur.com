export default async function Page() {
  const { default: Post } = await import(`@/content/resume.mdx`);

  return <Post />;
}

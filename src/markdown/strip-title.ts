import type { Root } from 'hast';

/**
 * Starlight draws the page's H1 from its title, so the H1 the file opens with goes. It goes after the
 * heading ids are given, so it still counts as GitHub counts it: under `# Input`, `## Input` is `#input-1`.
 * Its id stays on an empty anchor where it stood, so a link to `#input` still lands at the top.
 */
export function stripTitle() {
  return (tree: Root) => {
    const first = tree.children.findIndex((node) => !(node.type === 'text' && !node.value.trim()));
    const node = tree.children[first];
    if (node?.type !== 'element' || node.tagName !== 'h1') return;
    const id = node.properties.id;
    if (id) tree.children.splice(first, 1, { type: 'element', tagName: 'span', properties: { id }, children: [] });
    else tree.children.splice(first, 1);
  };
}

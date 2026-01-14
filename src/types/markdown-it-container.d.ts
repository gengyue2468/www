declare module 'markdown-it-container' {
  import MarkdownIt from 'markdown-it';

  interface ContainerOptions {
    validate: (params: string) => boolean;
    render: (tokens: any[], idx: number) => string;
  }

  function container(md: MarkdownIt, name: string, options: ContainerOptions): void;
  export = container;
}

export type IngestBody = {
  title: string
  content: string
  source: string
}

export type ChatBody = {
  question: string
}

export async function postIngest(_body: IngestBody): Promise<void> {}

export async function postChat(_body: ChatBody): Promise<void> {}

export async function getSources(): Promise<void> {}

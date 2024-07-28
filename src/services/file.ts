import { embeddings, llm } from "@/libs/openAI";
import { supabaseClient } from "@/libs/supabaseClient";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";

export interface IFile {
  id?: number | undefined;
  url: string;
  created_at?: Date | undefined;
}

export async function saveFile(url: string, content: string): Promise<IFile> {
    const doc = await supabaseClient
      .from("files")
      .select()
      .eq("url", url)
      .single<IFile>();
  
    if (!doc.error && doc.data?.id) return doc.data;
  
    const { data, error } = await supabaseClient
      .from("files")
      .insert({ url })
      .select()
      .single<IFile>();
  
    if (error) throw error;
  
    const splitter = new RecursiveCharacterTextSplitter({
      separators: ["\n\n", "\n", " ", ""],
    });
  
    const output = await splitter.createDocuments([content]);
    const docs = output.map((d) => ({
      ...d,
      metadata: { ...d.metadata, file_id: data.id },
    }));
  
    await SupabaseVectorStore.fromDocuments(docs, embeddings, {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    });
  
    return data;
  }
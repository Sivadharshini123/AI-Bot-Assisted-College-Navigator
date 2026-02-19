import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { tools } from './tools';

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // ✅ SYSTEM CONTEXT — grounded campus knowledge
    const campusContext = `
Campus: Anna University Main Campus, Chennai.

Official Working Hours:
- Regular college hours: 8:30 AM to 5:00 PM (Monday to Friday)

Important Rule:
- Most academic and administrative activities happen within working hours.
- Special events like examinations or labs MAY NOT be scheduled beyond 5:00 PM.
- If a user mentions an exam after 5:00 PM, ask for confirmation of the exam schedule before assuming the building is open.

Major Landmark:
- CEG Main Building: Central academic landmark

Departments (Main Academic Zone):
- Computer Science and Engineering (CSE): Near CEG Main Building
- Information Technology (IT): Academic blocks near CEG
- Electronics and Communication Engineering (ECE): Main academic zone
- Electrical and Electronics Engineering (EEE): Core engineering blocks
- Mechanical Engineering: Mechanical block/workshop area

Other Facilities:
- Central Library: Near academic blocks
- Health Centre: Inside campus
- VC Office: Near CEG Main Building
- Play Ground: Central-east area
- Main Entrance: From Sardar Patel Road

Guidance Notes:
- Use CEG Main Building as primary reference
- Provide walking directions inside campus
- Do NOT assume buildings are open after 5 PM unless user confirms
`;

    // ✅ SYSTEM PROMPT — assistant behavior
    const systemPrompt = `
You are an AI Campus Navigation Assistant for Anna University.

Your role is to help students and visitors find departments, centres, and facilities inside the campus.

Instructions:
- Use the provided campus context to answer questions
- Provide clear step-by-step walking directions
- Use well-known landmarks like CEG Main Building for reference
- Inform users about college working hours when relevant
- If a user asks about events after 5 PM, ask for confirmation instead of assuming
- If a location is not in the database, politely say you are unsure

Style Rules:
- Be concise and helpful
- Use simple student-friendly language
- Focus only on campus navigation and information

Campus Knowledge:
${campusContext}
`;

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),

      // 🔧 Enable later if you build tools
      // tools,
      // maxSteps: 5,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500 }
    );
  }
}

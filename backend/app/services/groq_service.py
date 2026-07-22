import json

from groq import Groq

from app.core.config import GROQ_API_KEY, MODEL
from app.prompts.travel_prompt import SYSTEM_PROMPT

client = Groq(api_key=GROQ_API_KEY)


def generate_trip(user_message: str):

    completion = client.chat.completions.create(

        model=MODEL,

        temperature=0.7,

        response_format={"type": "json_object"},

        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_message
            }
        ]
    )

    response = completion.choices[0].message.content

    return json.loads(response)
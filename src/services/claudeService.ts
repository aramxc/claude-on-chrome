export async function analyzeText(
    userInput: string,
    apiKey: string,
    modelName: string,
    responseStyle: string,
    systemInstruction: string = ""
  ): Promise<string> {
    console.log(`Analyzing text with model: ${modelName}, style: ${responseStyle}`);
    
    try {
      const requestBody: any = {
        model: modelName,
        max_tokens: 1000,
        messages: [
          { 
            role: 'user', 
            content: userInput 
          }
        ],
        temperature: responseStyle === 'creative' ? 0.9 : (responseStyle === 'precise' ? 0.3 : 0.5),
      };
      
      if (systemInstruction && systemInstruction.trim() !== '') {
        requestBody.system = systemInstruction;
      }
      
      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      
      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("API Error:", errorData);
        throw new Error(`API request failed: ${apiResponse.status} - ${errorData}`);
      }
  
      const responseData = await apiResponse.json();
      console.log("API Response:", responseData);
      return responseData.content[0].text || 'No response from Claude';
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }
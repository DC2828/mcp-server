import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod"
import fs from "node:fs/promises"
import { required } from "zod/v4-mini";
const server = new McpServer({
    name: "test",
    version:"1.0.0",
},{
    capabilities: {
        resources: {},
        tools: {
            "create-user": {
                description: "Create a new user in the database",
                parameters: z.object({
                    name: z.string().describe("The user's full name"),
                    email: z.string().describe("The user's email address"),
                    address: z.string().describe("The user's home address"),
                    phone: z.string().describe("The user's phone number")
                }).describe("Parameters for creating a new user"),
                required: ["name", "email", "address", "phone"],
            },
        },
        prompts: {},
    }
});

server.tool("create-user","Create a new user in the database",{
    name:z.string(),
    email:z.string(),
    address:z.string(),
    phone: z.string()
},{
    title:"Create User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint:true
},async (params) => {
    try{
        const id = await createUser(params);
        return {
            content: [
                {
                    type:"text",
                    text:`User ${id} created successfully`
                }
            ]
        };
    }catch{
        return{
            content: [
                {
                    type:"text",
                    text:"Failed to save user"
                }
            ]
        }
    }
});


async function createUser(user:{
    name:string,
    email:string,
    address:string,
    phone:string
}){
    const users = await import("./data/user.json", {
        with: {type:"json"}
    }).then(m => m.default);

    const id = users.length + 1;

    users.push({id, ...user});

    await fs.writeFile("./src/data/user.json", JSON.stringify(users,null,2));

    return id;
}

async function main(){
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main();
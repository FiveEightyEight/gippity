import React, { useState, useEffect } from 'react';
import {
    useLocation,
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { useStore } from '@nanostores/react';
import { $selectedModel } from '../stores/chat';
import { $accessToken, setAccessToken } from "../stores/token";
import { apiFetch } from "../utils/api";
const apiUrl = import.meta.env.PUBLIC_API_URL;
const apiVersion = import.meta.env.PUBLIC_API_VERSION;

import Chat from "./Chat";
import ChatHistory from "./ChatHistory";
import ModelSelector from "./ModelSelector";
import type { Model } from './types';

const Home: React.FC = () => {
    const [chat, setChat] = useState({});
    const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [currModel, setCurrModel] = useState("");
    const [loading, setLoading] = useState(false);
    const token = useStore($accessToken);
    const selectedModel = useStore($selectedModel);
    const location = useLocation();
    console.log("homecontainer location", location);

    const USER = "user";
    const SYSTEM = "system";
    const ASSISTANT = "assistant";

    useEffect(() => {
        const sessionValue = sessionStorage.getItem('tempSession');
        sessionStorage.removeItem('tempSession');
        sessionStorage.clear();
        setAccessToken(sessionValue);
        getModels();
    }, []);

    const getModels = async () => {
        try {
            const url = new URL(`${apiUrl}${apiVersion}/models`)
            let modelsResponse = await apiFetch(url.href)
            if (!modelsResponse) {
                window.location.href = "/register";
                return
            }
            const models = await modelsResponse.json();
            setModels(models);
        } catch (err) {
            console.log("error calling api", err);
            window.location.href = "/register";
        }
    }

    const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrModel(event.target.value);
    };

    const handleChatSubmit = () => {
        if (!currModel || currModel === "") {
            console.log("please select a model");
            return;
        }
        const chatInput = document.getElementById("chat-input") as HTMLInputElement;
        const content = chatInput?.value || "";
        setMessages(prevMessages => [...prevMessages, { role: USER, content }]);
        if (chatInput) chatInput.value = "";
        callModel();
    };

    const callModel = () => {
        if (!currModel || currModel === "") {
            console.log("please select a model");
            return;
        }
        const payload = {
            model: currModel,
            messages: messages,
        };
        setLoading(true);
        fetch(`${apiUrl}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((r) => r.json())
            .then((res) => {
                console.log(`SERVER REPLY`, res);
                setLoading(false);
            })
            .catch((err) => {
                console.log("error calling chat");
                setLoading(false);
            });
    };

    return (
        <main className="flex flex-row h-[100dvh] overflow-hidden">
            <div className="w-1/5">
                <ChatHistory />
            </div>
            <div className="h-full w-4/5">
                <Chat models={models} />
            </div>
        </main>
    );
};

const router = createBrowserRouter([
    {
        path: "/home",
        element: <Home />,
    },
]);

function HomeContainer() {
    return <RouterProvider router={router} />;
}

export default HomeContainer;

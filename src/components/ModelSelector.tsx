import React, { useEffect, useState } from "react";
import { useStore } from '@nanostores/react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

import { $selectedModel, setSelectedModel } from '../stores/chat';
import type { Model } from './types';


const ModelSelector = (props: { models: Model[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modelName, setModelName] = useState("");
    const selectedModel = useStore($selectedModel);
    
    useEffect(() => {
        if (!modelName && props.models.length > 0) {
            setModelName(props.models[0].name);
            setSelectedModel(props.models[0].version);
        }
    }, [props.models]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <MenuButton
                    onClick={toggleMenu}
                    className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    {selectedModel && modelName || "Select Model"}
                    <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" />
                </MenuButton>
            </div>

            {isOpen && (
                <MenuItems
                    className="absolute left-0 z-10 mt-2 w-56 origin-top rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                    <div className="py-1">
                        {props.models.map((model) => (
                            <MenuItem key={model.id}>
                                <button
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
                                    onClick={() => {
                                        setIsOpen(false)
                                        setModelName(model.name)
                                        setSelectedModel(model.version)
                                    }}
                                >
                                    {model.name}
                                </button>
                            </MenuItem>
                        ))}

                    </div>
                </MenuItems>
            )}
        </Menu>
    )
}

export default React.memo(ModelSelector);
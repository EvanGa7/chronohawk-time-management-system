import React from "react";
import { Button as NextUIButton } from "@nextui-org/react";
import { useRouter } from 'next/navigation'; // Corrected the import

export function Button() {
    //function to route to the add tasks page
    const router = useRouter();
    const handleClick = () => {
        router.push('./calendar/tasks');
    };

    return (
        <div className="flex justify-end gap-4 items-center w-full"> {/* Added justify-end and w-full */}
            <NextUIButton className='bg-buddha-500' variant="flat" onClick={handleClick}>
                Add Task
            </NextUIButton>  
        </div>
    );
}



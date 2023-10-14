import React from "react";
import { Link, Button as NextUIButton } from "@nextui-org/react";
import { useRouter } from 'next/navigation'; // Corrected the import

export function Button() {
    //function to route to the add tasks page

    return (
        <div className="flex justify-end gap-4 items-center w-full"> {/* Added justify-end and w-full */}
            <NextUIButton className='bg-buddha-500' variant="flat">
                <Link href="/calendar/tasks" aria-current="page" className='text-buddha-950'>
                    Add Task
                </Link>
            </NextUIButton>
        </div>
    );
}



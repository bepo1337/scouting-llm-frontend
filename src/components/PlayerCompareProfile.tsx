import React from 'react'

type ProfileProps = {
    id: number | any
    name: string |any
}

export default function PlayerCompareProfile({ id, name }: ProfileProps) {

    // load image
    // positional attributes and height/size etc?


    return (
        <div>
            <div>
                {name}
            </div>
        </div>
    )
}

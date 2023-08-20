import { Colors } from "@/colors/colors"
import { css } from "@emotion/react"

export const UtilityMessage: React.FC<{
    errorMessage?: string;
}> = ({
    errorMessage
}) => {
    if (errorMessage){
        return (
            <p css={utilityMessageStyle}>{errorMessage}</p>
        )
    }
    return (
        <p css={utilityMessageStyle}>Loading...</p>
    )
}

const utilityMessageStyle = css({
    color: Colors.blueSky,
})
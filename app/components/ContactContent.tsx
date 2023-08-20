import { Colors } from "@/colors/colors"
import { Contact } from "@/interfaces/Contact"
import { css } from "@emotion/react"
import { BiEdit, BiSolidStar, BiSolidTrash, BiStar } from "react-icons/bi"

export const ContactContent: React.FC<{
    onOpenModal: () => void,
    addToFavorite: () => void,
    deleteContact: () => void,
    editContact: () => void,
    contact: Contact,
}> = ({
    contact,
    onOpenModal,
    addToFavorite,
    deleteContact,
    editContact,
}) => {

        return (
            <div css={mainButton}>
                <a onClick={onOpenModal} css={anchor}>
                    <div>
                        <p css={mainText}>{contact.first_name} {contact.last_name}</p>
                        {contact.phones.length > 1 ? <p css={subText}>{contact.phones[0].number}...</p> : <p css={subText}> {contact.phones[0].number}</p>}
                    </div>

                </a>
                <div css={optionWrapper}>
                    <a css={iconMargin} onClick={addToFavorite}>
                        <BiSolidStar size={24} color={contact.isFavorite ? Colors.yellowStar : Colors.white} />
                    </a>
                    <a css={iconMargin} onClick={editContact}>
                        <BiEdit size={24} />
                    </a>
                    <a css={iconMargin} onClick={deleteContact}>
                        <BiSolidTrash size={24} />
                    </a>
                </div>
            </div>

        )
    }

const breakpoints = [{
    minWidth: 280,
    maxWidth: 420,
}]

const mq = breakpoints.map(bp => `@media (min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px)`)

const mainButton = css({
    flex: 1,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: Colors.grayBlack,
    color: Colors.white,
    border: 10,
    borderColor: "black",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    [mq[0]] : {
        display: "block",
        padding: 20,
    }
})

const mainText = css({
    fontSize: 24,
})

const anchor = css({
    flex: 1,
    padding: 20,
})

const subText = css({
    fontSize: 16,
    fontWeight: 'lighter',
    marginTop: 5,
})

const optionWrapper = css({
    display: "flex",
    alignItems: "center",
    paddingRight: 15,
})

const iconMargin = css({
    marginLeft: 15,
    marginRight: 15,
})
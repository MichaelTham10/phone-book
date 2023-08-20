// 'use client'
import { Colors } from "@/colors/colors";
import { DetailContact } from "@/interfaces/DetailContact";
import { gql, useQuery } from "@apollo/client";
import { css } from "@emotion/react";
import { BiX } from "react-icons/bi";
import { UtilityMessage } from "./UtilityMessage";

const GET_CONTACT_DETAIL = gql`
    query GetContactDetail($id: Int!){
        contact_by_pk(id: $id) {
            last_name
            id
            first_name
            created_at
            phones {
                number
            }
        }
    }
`;

export const DetailModal: React.FC<{
    onClose: () => void;
    contactId: number;
}> = ({
    onClose,
    contactId,
}) => {
        const { data, loading, error } = useQuery<DetailContact>(GET_CONTACT_DETAIL, {
            variables: { id: contactId }
        })

        if (loading || !data) {
            return (
                <UtilityMessage/>
            )
        }

        if (error) {
            return (
                <UtilityMessage errorMessage={error.message}/>
            )
        }

        return (
            <div css={overlay}>
                <div css={modalWrapper}>
                    <div css={modal}>
                        <div css={header}>
                            <p>Detail Contact</p>
                            <a href="#" onClick={onClose}>
                                <BiX size={24} />
                            </a>
                        </div>
                        <div css={body}>
                            <p css={fullName}>{data.contact_by_pk.first_name} {data.contact_by_pk.last_name}</p>
                            <div css={numberWrapper}>
                                {
                                    data.contact_by_pk.phones.map((item, i) => <p css={subText} key={i}>{item.number}</p>)
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

const breakpoints = [
    {
        minWidth: 280,
        maxWidth: 700,
    },
    {
        minWidth: 280,
        maxWidth: 540,
    }
]

const mq = breakpoints.map(bp => `@media (min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px)`)

const overlay = css({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.blackOpacity,
})

const modalWrapper = css({
    width: "50%",
    height: "70%",
    [mq[0]]: {
        width: "80%",
        height: "60%",
    },
    [mq[1]]: {
        width: "80%",
        height: "60%",
    },
})

const modal = css({
    backgroundColor: Colors.grayBlack,
    height: "100%",
    width: "100%",
    borderRadius: 15,
    padding: 15,
    color: Colors.white,
})

const header = css({
    display: "flex",
    justifyContent: "space-between",
    fontSize: 24,
})

const body = css({
    marginTop: 15,
    textAlign: "center",
})

const fullName = css({
    fontSize: 48,
    marginBottom: 15,
})

const subText = css({
    fontSize: 24,
    fontWeight: 'lighter',
    marginTop: 15,
})

const numberWrapper = css({
    height: 500,
    overflowY: "scroll",
    scrollBehavior: "smooth",
})
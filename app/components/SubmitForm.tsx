import { Colors } from "@/colors/colors"
import { Contact, Contacts, Phone } from "@/interfaces/Contact";
import { RequestContact } from "@/interfaces/RequestContact";
import { gql, useQuery } from "@apollo/client";
import { css } from "@emotion/react"
import { useEffect, useState } from "react";
import { BiPlusCircle, BiUserPlus, BiX, BiXCircle } from "react-icons/bi"
import { UtilityMessage } from "./UtilityMessage";

const GET_CONTACT_LIST = gql`
  query GetContactList (
      $distinct_on: [contact_select_column!], 
      $limit: Int, 
      $offset: Int, 
      $order_by: [contact_order_by!], 
      $where: contact_bool_exp
    ) {
    contact(
        distinct_on: $distinct_on, 
        limit: $limit, 
        offset: $offset, 
        order_by: $order_by, 
        where: $where
    ){
      created_at
      first_name
      id
      last_name
      phones {
        number
      }
    }
  }
`;

export const SubmitForm: React.FC<{
    submitForm: (ReqModel: RequestContact) => void;
    setCloseForm: () => void;
    contact?: Contact | undefined,
}> = ({
    submitForm,
    setCloseForm,
    contact,
}) => {

        const { data, loading, error } = useQuery<Contacts>(GET_CONTACT_LIST);

        const [id, setId] = useState(0);

        const [firstName, setFirstName] = useState("");

        const [lastName, setLastName] = useState("");

        const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);

        useEffect(() => {
            if (contact) {
                const numberList: string[] = [];

                setId(contact.id);

                setFirstName(contact.first_name);

                setLastName(contact.last_name);

                contact.phones.forEach(q => {
                    numberList.push(q.number);
                });

                setPhoneNumbers(numberList);
            }
        }, [contact])

        function handlePhoneNumberInput(index: number, value: string) {
            const numbers = [...phoneNumbers];
            numbers[index] = value
            setPhoneNumbers(numbers);
        }

        function addPhoneNumberInput() {
            const values = [...phoneNumbers];
            values.push("");
            setPhoneNumbers(values);
        }

        function removePhoneNumberInput(index: number) {
            const values = [...phoneNumbers];
            values.splice(index, 1);
            setPhoneNumbers(values);
        }

        function handleSubmit() {
            if (data) {
                const regex = /^[A-Za-z]+$/;

                if (data.contact.filter(q => q.first_name === firstName && q.last_name === lastName).length > 0) {
                    alert("Name already exist")
                }

                else if (!firstName.match(regex) || !lastName.match(regex)) {
                    alert("Name must alphabets");
                }
                else {
                    const convertedPhones: Phone[] = [];

                    phoneNumbers.forEach((q) => {
                        convertedPhones.push({
                            number: q,
                        });
                    })

                    const request: RequestContact = {
                        id: id,
                        first_name: firstName,
                        last_name: lastName,
                        phones: convertedPhones,
                    }

                    submitForm(request);
                }
            }
        }

        if (loading || !data) {
            return (
                <UtilityMessage />
            )
        }

        if (error) {
            return (
                <UtilityMessage errorMessage={error.message} />
            )
        }

        return (
            <div css={formWrapper}>
                <div css={titleWrapper}>
                    <a onClick={setCloseForm}>
                        <BiX size={48} color={Colors.blueSky} />
                    </a>
                    <p css={title}>Contact Form</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div css={inputWrapper}>
                        <p css={labelStyle}>First name</p>
                        <input css={inputStyle} type="text" name="firstName" placeholder="input first name" onChange={(e) => setFirstName(e.target.value)} value={firstName} />
                    </div>

                    <div css={inputWrapper}>
                        <p css={labelStyle}>Last name</p>
                        <input css={inputStyle} type="text" name="lastName" placeholder="input last name" onChange={(e) => setLastName(e.target.value)} value={lastName} />
                    </div>

                    <div css={inputWrapper}>
                        <div css={iconWrapper}>
                            <p css={phoneNumberLabelStyle}>Phone number</p>
                            <a css={iconStyle} onClick={addPhoneNumberInput}>
                                <BiPlusCircle size={30} />
                            </a>
                        </div>
                        {
                            phoneNumbers.map((phone, idx) => (
                                <div key={idx} css={iconWrapper}>
                                    <input css={inputStyle} type="tel" name="phoneNumber" placeholder="input phone number" value={phone} onChange={(e) => handlePhoneNumberInput(idx, e.target.value)} />
                                    {
                                        idx !== 0 &&
                                        <a css={iconStyle} onClick={() => removePhoneNumberInput(idx)}>
                                            <BiXCircle size={30} />
                                        </a>
                                    }
                                </div>
                            ))
                        }
                    </div>
                    <button css={addButton} type="submit">
                        <div css={flexAlignCenter}>
                            <p css={buttonText}>Submit Form</p>
                        </div>
                    </button>
                </form>
            </div>
        )
    }

// const breakpoints = [{
//     minWidth: 280,
//     maxWidth: 1025,
// }]

// const mq = breakpoints.map(bp => `@media (min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px)`)

const title = css({
    color: Colors.blueSky,
    fontSize: 48,
})

const titleWrapper = css({
    display: "flex",
    alignItems: "center"
})

const inputStyle = css({
    padding: 10,
    border: "none",
    outline: "none",
    width: "100%",
    borderRadius: 5,
    backgroundColor: Colors.grayBlack,
    color: Colors.white,
})

const formWrapper = css({
    flex: 1,
    position: "fixed",
    height: "100vh",
    top: 0,
    bottom: 0,
    color: Colors.white,
    paddingTop: 10,
    background: Colors.sidebarBackground,
    padding: 20,
})

const labelStyle = css({
    fontSize: 20,
    marginBottom: 15,
})

const phoneNumberLabelStyle = css({
    fontSize: 20,
})

const inputWrapper = css({
    marginTop: 15,
})

const iconWrapper = css({
    display: "flex",
    alignItems: "center",
    marginBottom: 10,
})

const iconStyle = css({
    marginLeft: 20,
    cursor: "pointer"
})

const addButton = css({
    padding: 10,
    fontSize: 16,
    borderRadius: 10,
    backgroundColor: Colors.blueSky,
    borderColor: Colors.blueSky,
    color: Colors.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
})

const buttonText = css({
    marginLeft: 10,
})

const flexAlignCenter = css({
    display: "flex",
    alignItems: "center",
})



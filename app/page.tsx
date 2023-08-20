// 'use client'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Contact, Contacts } from '@/interfaces/Contact';
import { css } from '@emotion/react';
import { ContactContent } from './components/ContactContent';
import { Colors } from '@/colors/colors';
import { BiMenu, BiSearch, BiUserPlus } from "react-icons/bi"
import { useEffect, useState } from 'react';
import { DetailModal } from './components/DetailModal';
import { FavoriteContactList, GeneralContactList } from '@/common/LocalStorageKey';
import { useRouter } from 'next/navigation';
import { UtilityMessage } from './components/UtilityMessage';
import { SubmitForm } from './components/SubmitForm';
import { RequestContact } from '@/interfaces/RequestContact';


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

const DELETE_CONTACT = gql`
  mutation MyMutation($id: Int!) {
    delete_contact_by_pk(id: $id) {
      first_name
      last_name
      id
    }
  }
`;

const ADD_CONTACT = gql`
    mutation AddContactWithPhones(
        $first_name: String!, 
        $last_name: String!, 
        $phones: [phone_insert_input!]!
        ) {
    insert_contact(
        objects: {
            first_name: $first_name, 
            last_name: 
            $last_name, phones: { 
                data: $phones
                }
            }
        ) {
        returning {
        first_name
        last_name
        id
        phones {
            number
        }
        }
    }
    }
`;

const UPDATE_CONTACT = gql`
  mutation EditContactById($id: Int!, $_set: contact_set_input) {
    update_contact_by_pk(pk_columns: {id: $id}, _set: $_set) {
      id
      first_name
      last_name
      phones {
        number
      }
    }
  }
`

export default function Home() {
  const [query, setQuery] = useState("");

  const [showDetail, setShowDetail] = useState(false);

  const [contactId, setContactId] = useState(0);

  const { data, loading, fetchMore, refetch, error } = useQuery<Contacts>(GET_CONTACT_LIST, {
    variables: {
      limit: 2, offset: 0,
      where: {
        _or: [
          { first_name: { _ilike: `%${query}%` } },
          { last_name: { _ilike: `%${query}%` } }
        ],
      }
    }
  });

  const [deleteContact, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_CONTACT);

  const [updateContact, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_CONTACT);

  const [addContact, { loading: createLoading, error: createrError }] = useMutation(ADD_CONTACT);

  const limitFavorite = 2;

  const [loadLoading, setLoadLoading] = useState(false);

  const [isOpenForm, setIsOpenForm] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);

  const [favoriteContacts, setFavoriteContacts] = useState<Contact[]>([]);

  const [paginatedFavoriteContacts, setPaginatedFavoriteContacts] = useState<Contact[]>([]);

  const [isLoadMore, setLoadMore] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);

  const [contact, setContact] = useState<Contact>();

  const [isEditFavorite, setIsEditFavorite] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (data) {
      const storedFavorite = localStorage.getItem(FavoriteContactList);

      if (storedFavorite) {
        const storeFavoriteList: Contact[] = JSON.parse(storedFavorite);

        const filteredGeneralList: Contact[] = [];

        data.contact.forEach(item => {
          if (storeFavoriteList.filter(i => i.id === item.id).length === 0) {
            filteredGeneralList.push(item);
          }
        });

        localStorage.setItem(GeneralContactList, JSON.stringify(filteredGeneralList));
      }
      else {
        localStorage.setItem(GeneralContactList, JSON.stringify(data.contact));
      }

    }
  }, [data]);

  useEffect(() => {
    if (favoriteContacts.length > 0) {
      localStorage.setItem(FavoriteContactList, JSON.stringify(favoriteContacts));
    }
  }, [favoriteContacts]);

  useEffect(() => {
    const stored = localStorage.getItem(GeneralContactList);
    if (stored) {
      const storedContacts: Contact[] = JSON.parse(stored);
      setContacts(storedContacts);
    }
  }, [data]);

  useEffect(() => {
    const stored = localStorage.getItem(FavoriteContactList);
    if (stored) {
      const storedContacts: Contact[] = JSON.parse(stored);
      setFavoriteContacts(storedContacts);
    }
  }, [data]);

  useEffect(() => {
    const stored = localStorage.getItem(FavoriteContactList);
    if (stored) {
      const storedContacts: Contact[] = JSON.parse(stored);
      if (storedContacts.length >= 0 && !isLoadMore) {
        setPaginatedFavoriteContacts(favoriteContacts.slice(0, limitFavorite));
      }
    }
  }, [favoriteContacts, isLoadMore])

  async function handleFavoriteDeleteContact(itemId: number, i: number) {
    try {
      const res = await deleteContact({ variables: { id: itemId } });
      if (res.data) {
        favoriteContacts.splice(i, 1);
        paginatedFavoriteContacts.splice(i, 1);
        localStorage.setItem(FavoriteContactList, JSON.stringify(favoriteContacts));
        await refetch();
        router.push("/");
        alert("Success delete contact");
      }
    } catch (e) {
      alert(`Failed to delete contact ${e}`);
    }
  }

  async function handleFavoriteEditContact(req: RequestContact) {
    try {
      const res = await updateContact({
        variables: {
          id: req.id,
          _set: {
            first_name: req.first_name,
            last_name: req.last_name,
          }
        }
      });
      if (res.data) {
        const idx = favoriteContacts.findIndex((q => q.id == req.id));
        favoriteContacts[idx].first_name = req.first_name;
        favoriteContacts[idx].last_name = req.last_name;

        setFavoriteContacts(prevArray => prevArray.map(item =>
          item.id === req.id ? { ...item, first_name: req.first_name, last_name: req.last_name } : item
        ));

        localStorage.setItem(FavoriteContactList, JSON.stringify(favoriteContacts));

        await refetch();

        router.push("/");
        alert("Success update contact");
      }
    } catch (e) {
      alert(`Failed to update contact ${e}`);
    }
  }

  async function handleGeneralEditContact(req: RequestContact) {
    try {
      const res = await updateContact({
        variables: {
          id: req.id,
          _set: {
            first_name: req.first_name,
            last_name: req.last_name,
          }
        }
      });
      if (res.data) {
        const idx = contacts.findIndex((q => q.id == req.id));

        setContacts(prevArray => prevArray.map(item =>
          item.id === req.id ? { ...item, first_name: req.first_name, last_name: req.last_name } : item
        ));

        console.log("Before : ", contacts[idx]);

        contacts[idx].first_name = req.first_name;
        contacts[idx].last_name = req.last_name;

        console.log("After : ", contacts[idx]);

        localStorage.setItem(GeneralContactList, JSON.stringify(contacts));
        await refetch();
        router.push("/");
        alert("Success update contact");
      }
    } catch (e) {
      alert(`Failed to update contact ${e}`);
    }
  }

  async function handleGeneralDeleteContact(itemId: number, i: number) {
    try {
      const res = await deleteContact({ variables: { id: itemId } });
      if (res.data) {
        contacts.splice(i, 1);
        localStorage.setItem(GeneralContactList, JSON.stringify(contacts));
        await refetch();
        router.push("/");
        alert("Success delete contact");
      }
    } catch (e) {
      alert(`Failed to delete contact ${e}`);
    }
  }

  async function handleCreate(req: RequestContact) {
    try {
      const res = await addContact({
        variables: {
          first_name: req.first_name,
          last_name: req.last_name,
          phones: req.phones,
        }
      })
      if (res.data) {
        alert("Success add contact");
        router.push("/");
      }
    } catch (e) {
      alert(`Failed add contact: ${e}`);
    }
  }

  async function handleSubmit(req: RequestContact) {
    if (contact === undefined) {
      await handleCreate(req);
    } else {
      if (isEditFavorite) {
        await handleFavoriteEditContact(req);
      } else {
        await handleGeneralEditContact(req);
      }
    }
  }

  async function handleLoadMore() {
    setLoadLoading(true);
    if (isFavorite) {
      if (paginatedFavoriteContacts.length < favoriteContacts.length) {
        const currLength = paginatedFavoriteContacts.length;
        const nextPagination = favoriteContacts.slice(currLength, currLength + limitFavorite);
        setPaginatedFavoriteContacts((prev) => [...prev, ...nextPagination]);
        setLoadMore(true);
      }
      setLoadLoading(false);
    } else {
      try {
        await fetchMore({
          variables: {
            offset: data?.contact.length,
            limit: 2,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              contact: [
                ...prev.contact, ...fetchMoreResult.contact
              ]
            }
          }
        });
        setLoadLoading(false);
      }
      catch (e) {
        setLoadLoading(false);
        alert(`Failed to load more ${e}`);
      }
    }
  }

  function renderContactList() {
    const filteredFavoriteData = paginatedFavoriteContacts.filter(Q => Q.first_name.toLowerCase().includes(query.toLowerCase()) || Q.last_name.toLowerCase().includes(query.toLowerCase()));

    if (loading || !data || !contacts || deleteLoading || createLoading || updateLoading) {
      return (
        <UtilityMessage />
      )
    }

    if (error) {
      return (
        <UtilityMessage errorMessage={error.message} />
      )
    }

    if (deleteError) {
      return (
        <UtilityMessage errorMessage={deleteError.message} />
      )
    }

    if (createrError) {
      return (
        <UtilityMessage errorMessage={createrError.message} />
      )
    }

    if (updateError) {
      return (
        <UtilityMessage errorMessage={updateError.message} />
      )
    }

    if ((!isFavorite && contacts.length === 0) || (isFavorite && filteredFavoriteData.length === 0)) {
      return (
        <UtilityMessage errorMessage={"Data is empty please add some contacts"} />
      )
    }

    return (
      <>
        {
          isFavorite ?
            filteredFavoriteData.map((item, i) =>
              <ContactContent
                key={i}
                isFavorite={true}
                onOpenModal={() => {
                  setShowDetail(true);
                  setContactId(item.id);
                }}
                addToFavorite={() => {
                  setContacts(prevState => [...prevState, item]);
                  favoriteContacts.splice(i, 1);
                  paginatedFavoriteContacts.splice(i, 1);
                  localStorage.setItem(FavoriteContactList, JSON.stringify(favoriteContacts));
                }}
                editContact={() => {
                  setContact(item);
                  setIsEditFavorite(true);
                  setIsOpenForm(true);
                }}
                deleteContact={() => handleFavoriteDeleteContact(item.id, i)}
                contact={item}
              />)
            :
            contacts.map((item, i) =>
              <ContactContent
                key={i}
                isFavorite={false}
                onOpenModal={() => {
                  setShowDetail(true);
                  setContactId(item.id);
                }}
                addToFavorite={() => {
                  setFavoriteContacts(prevState => [...prevState, item]);
                  contacts.splice(i, 1);
                  localStorage.setItem(GeneralContactList, JSON.stringify(contacts));
                }}
                editContact={() => {
                  setContact(item);
                  setIsEditFavorite(false);
                  setIsOpenForm(true);
                }}
                deleteContact={() => handleGeneralDeleteContact(item.id, i)}
                contact={item}
              />)
        }
        <button onClick={() => handleLoadMore()} css={fetchMoreText}>{loadLoading ? "Loading..." : "Load more"}</button>
        {showDetail &&
          <DetailModal onClose={() => setShowDetail(false)} contactId={contactId} />
        }
      </>
    )
  }

  return (
    <main css={mainStyle} >
      {isOpenForm && <SubmitForm submitForm={(req: RequestContact) => handleSubmit(req)} contact={contact} setCloseForm={() => setIsOpenForm(false)} />}
      <div css={[mainDiv, isOpenForm && isFormOpenStyle]}>
        <div css={headerStyle}>
          <div css={titleWrapper}>
            <a onClick={() => setIsOpenForm((prev) => !prev)}>
              <BiMenu color={Colors.blueSky} size={48} />
            </a>
            <p css={title}>Contacts</p>
          </div>
          <div css={[flexAlignCenter, mirrorInputStyle]}>
            <BiSearch size={24} />
            <input type='text' placeholder='Search contact' css={inputSearchStyle} value={query} onChange={(e) => {
              setQuery(e.target.value);
            }} />
          </div>
        </div>
        <div css={contactListOption}>
          <a onClick={() => setIsFavorite(false)} css={[contactListOptionDiv, !isFavorite && isOptionActive]}>General Contact List</a>
          <a onClick={() => setIsFavorite(true)} css={[contactListOptionDiv, isFavorite && isOptionActive]}>Favorite Contact List</a>
        </div>
        {renderContactList()}
      </div>
    </main>
  )
}

const breakpoints = [
  {
    minWidth: 280,
    maxWidth: 540,
  },
  {
    minWidth: 280,
    maxWidth: 1770,
  }
]

const mq = breakpoints.map(bp => `@media (min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px)`)

const mainStyle = css({
  flex: 1,
  display: "flex",
})

const mainDiv = css({
  flex: 1,
  marginLeft: 20,
  marginRight: 20,
})

const isFormOpenStyle = css({
  marginLeft: "22%",
  [mq[1]]: {
    marginLeft: 20,
  }
})

const title = css({
  color: Colors.blueSky,
  fontSize: 48,
})

const headerStyle = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10,
  marginBottom: 5,
  [mq[0]]: {
    display: "block",
  }
})

const flexAlignCenter = css({
  display: "flex",
  alignItems: "center",
})

const inputSearchStyle = css({
  padding: 10,
  border: "none",
  outline: "none",
  borderRadius: 25,
  width: "70%",
  backgroundColor: Colors.grayBlack,
  color: Colors.white,
})

const mirrorInputStyle = css({
  backgroundColor: Colors.grayBlack,
  padding: 5,
  marginRight: 15,
  borderRadius: 25,
  paddingLeft: 10,
  color: Colors.white,
})

const fetchMoreText = css({
  display: "flex",
  margin: "auto",
  padding: 10,
  borderRadius: 10,
  backgroundColor: Colors.blueSky,
  borderColor: Colors.blueSky,
  color: Colors.white,
  marginBottom: 20,
  fontSize: 16,
})

const contactListOption = css({
  display: "flex",
  marginTop: 10,
})

const contactListOptionDiv = css({
  color: Colors.white,
  ":hover": {
    color: Colors.blueSky
  },
  marginRight: 10,
  cursor: "pointer"
})

const isOptionActive = css({
  color: Colors.blueSky,
})

const titleWrapper = css({
  display: "flex",
  alignItems: "center"
})
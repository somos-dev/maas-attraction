import { useEffect, useState } from 'react';
import { Role } from 'src/@types/role';
import { getRoles } from 'src/services/rolesService';

export function useFetchRoles(fetchAtStart = true) {
  const [data, setData] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [time, setTime] = useState(new Date().getTime());
  const [cantFetch, setCantFetch] = useState(fetchAtStart);

  const reFetch = () => {
    setTime(new Date().getTime());
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await getRoles();
        setData(result?.data?.data);
      } catch (error) {
        setData([]);
        setIsError(true);
      }

      setIsLoading(false);
    };

    if (cantFetch) {
      fetchData();
    } else {
      setCantFetch(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  return { data, isError, isLoading, reFetch };
}

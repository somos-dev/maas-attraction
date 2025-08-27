import { useCallback, useEffect, useRef, useState } from 'react';
import { HOST_API_URL } from 'src/config';
import { ENDPOINTS_NOTIFICATIONS } from 'src/routes/api_endpoints';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Notification } from 'src/@types/notifications';
import { usePWA } from './use-pwa';

export type LiveDataOptions = {
  connectionRetries?: number;
  retryInterval?: number;
  fetchAtStart?: boolean;
};

export function useLiveNotifications(options?: LiveDataOptions) {
  const [data, setData] = useState<Notification | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [connectTries, setConnectTries] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const abortCtrlRef = useRef<AbortController | null>(null);
  const timeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [time, setTime] = useState(new Date().getTime());
  const [cantFetch, setCantFetch] = useState(
    options && options.hasOwnProperty('fetchAtStart') ? options.fetchAtStart : true
  );
  const [internalOptions, setInternalOptions] = useState({
    connectionRetries: options?.connectionRetries || 3,
    retryInterval: options?.retryInterval || 2000,
  });
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const { notificationPermission, requestNotificationPermission } = usePWA();

  const reFetch = () => {
    setTime(new Date().getTime());
  };

  const showNotification = useCallback((notification: Notification) => {
    // Show browser notification if permission granted
    if (notificationPermission === 'granted' && 'Notification' in window) {
      new window.Notification(notification.title || 'New Notification', {
        body: notification.message,
        icon: '/logo.png',
        badge: '/logo.png',
        data: notification,
      });
    }
  }, [notificationPermission]);

  const connect = () => {
    const getRealtimeData = (liveData: Notification) => {
      //console.log(liveData);
      setData(liveData);
      showNotification(liveData);
    };

    ///////////////
    const fetchData = async () => {
      //const controller = new AbortController();
      abortCtrlRef.current = new AbortController();
      abortCtrlRef.current.signal.addEventListener('abort', () => console.log('abort!'));
      await fetchEventSource(`${HOST_API_URL}${ENDPOINTS_NOTIFICATIONS.liveNotifications}`, {
        signal: abortCtrlRef?.current.signal,
        openWhenHidden: true,
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${accessToken}`,
        },
        async onopen(res) {
          if (res.ok && res.status === 200) {
            //console.log('Connection made ', res);
            setConnecting(false);
            setHasError(false);
          } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            console.log('Client side error ', res);
            //setConnecting(false);
            reConnect();
          }
        },
        onmessage(event) {
          //console.log(event);
          //const parsedData = JSON.parse(event.data);
          //setData((data) => [...data, parsedData]);
          if (event?.data) {
            getRealtimeData(JSON.parse(event?.data));
          }
        },
        onclose() {
          console.log('Connection closed by the server');
          //setHasError(true);
          reConnect();
        },
        onerror(err) {
          // console.log('There was an error from server', err);
          console.log('Error SSE ', err);
          //sse.close();
          reConnect();
        },
      });
    };
    fetchData();
  };

  const reConnect = useCallback(() => {
    setConnectTries((prevState) => {
      if (prevState >= internalOptions.connectionRetries - 1) {
        setHasError(true);
        setConnecting(false);
        return prevState;
      } else {
        timeOutRef.current = setTimeout(() => {
          connect();
        }, internalOptions.retryInterval);
      }
      return prevState + 1;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectTries]);

  useEffect(() => {
    if (connectTries !== 0) {
      setConnectTries((prevState) => 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  useEffect(() => {
    if (cantFetch) {
      setConnecting(true);
      abortCtrlRef.current && abortCtrlRef.current.abort();
      if (data) {
        setData(null);
      }
      // Request notification permission on first connection
      if (notificationPermission === 'default') {
        requestNotificationPermission();
      }
      connect();
    } else {
      setCantFetch(true);
    }
    return () => {
      abortCtrlRef.current && abortCtrlRef.current.abort();
      timeOutRef.current && clearTimeout(timeOutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, notificationPermission, requestNotificationPermission]);

  return { data, hasError, connecting, reFetch };
}

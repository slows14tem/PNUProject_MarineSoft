import "./View1.css";
import { useState, useEffect, useCallback } from "react";
import { useSelector } from 'react-redux';
import { getSearchResults, addBasket } from "../../API/funcAPI";
import { Paging } from "../../Component/Paging/Paging";
import jwtDecode from "jwt-decode";

//리스트 출력, 과거데이터 출력, 장바구니 저장
function SelectedList() {

  let { SearchInfo } = useSelector((state) => { return state })
  const [decode, setDecode] = useState('')  //토큰 해독(memberid)
  const [data, setData] = useState(); //통신 데이터 저장
  const [checkItems, setCheckItems] = useState([]); //체크한 아이템 저장

  useEffect(() => {
    try {
      setDecode(jwtDecode(sessionStorage.getItem('accessToken')))
    } catch (error) {
      console.log("토큰 없음", error)
    }
  }, [])

  const fixPrice = useCallback(price => {
    return parseInt(price.toFixed(0)).toLocaleString();
  }, []);

  useEffect(() => {
    //context값(lead)가 빈값이 아닐때 통신 호출
    if (SearchInfo[0] !== '') {
      (async () => {
        await getSearchResults(SearchInfo)
          .then((res) => {
            //모든 데이터를 datas에 넣기
            setData(res);
          })
      })();
    }
  }, [SearchInfo]);

  // 체크박스 단일 선택
  const handleSingleCheck = (checked, id) => {
    if (checked) {
      // 단일 선택 시 체크된 아이템을 배열에 추가
      setCheckItems([...checkItems, id]);
    } else {
      // 단일 선택 해제 시 체크된 아이템을 제외한 배열 (필터)
      setCheckItems(checkItems.filter((el) => el !== id));
    }
  };

  //전체 선택
  const handleAllCheck = (checked) => {
    if (checked) {
      // 전체 선택 클릭 시 데이터의 모든 아이템(id)를 담은 배열로 checkItems 상태 업데이트
      const idArray = [];
      currentPosts.forEach((el) => idArray.push(el.id));
      setCheckItems(idArray);
    }
    else {
      // 전체 선택 해제 시 checkItems 를 빈 배열로 상태 업데이트
      setCheckItems([]);
    }
  }

  //체크박스 선택한 행 삭제
  const removeRow = () => {
    setData(data.filter((item) =>
      !checkItems.includes(item.id)
    ))
    alert("삭제되었습니다.")
    //예외처리 필요
  }

  //선택저장 버튼 클릭 (장바구니 추가)
  const addItemBasket = () => {
    const arr = [];
    //선택한 목록을 배열에 추가
    data?.filter((item) => checkItems.includes(item.id)).map((i) => { arr.push([i.id, parseInt(decode.sub)]) });

    (async () => {
      await addBasket(arr)
        .then((res) => res)
    })();
    alert("저장되었습니다.");
    window.location.replace("/view3")
  }

  //pagination 적용 (react-js-pagination)
  const [count, setCount] = useState(0); //아이템 총 개수
  const [currentpage, setCurrentpage] = useState(1); //현재페이지
  const [postPerPage] = useState(10); //페이지당 아이템 개수
  const [indexOfLastPost, setIndexOfLastPost] = useState(0);
  const [indexOfFirstPost, setIndexOfFirstPost] = useState(0);
  const [currentPosts, setCurrentPosts] = useState(0);

  useEffect(() => {
    setCount(data?.length);
    setIndexOfLastPost(currentpage * postPerPage);
    setIndexOfFirstPost(indexOfLastPost - postPerPage);
    setCurrentPosts(data?.slice(indexOfFirstPost, indexOfLastPost));
    setCheckItems([]); //페이지 넘겼을 때 전체 선택 체크박스가 클릭되어있는 현상 수정
  }, [currentpage, indexOfFirstPost, indexOfLastPost, data, postPerPage]);

  //페이지 변경할때마다 발생하는 이벤트(새로운 페이지 입력)
  const setPage = (e) => {
    setCurrentpage(e);
  };

  return (
    <>
      <div className="searchList">
        <table className="searchTable">
          <thead>
            <tr>
              {/* 체크박스 전체 클릭 */}
              <th><input className="th1" type={'checkbox'} onChange={(e) => handleAllCheck(e.target.checked)}
                checked={checkItems?.length === currentPosts?.length ? true : false}></input></th>
              <th className="th2">Machinery</th>
              <th className="th2">청구품목</th>
              <th className="th2">Part.No</th>
              <th className="th2">카테고리</th>
              <th className="th2">발주처</th>
              <th className="th3">견적화폐</th>
              <th className="thcost">견적단가</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts && data.length > 0 ? currentPosts.map((item, index) => (
              <tr key={index} >
                {/* 체크박스 클릭 */}
                <td><input className="th1" type={'checkbox'} onChange={(e) => handleSingleCheck(e.target.checked, item.id)}
                  checked={checkItems.includes(item.id) ? true : false}></input></td>
                <td className="th2">{item.machinery}</td>
                <td className="th2">{item.items}</td>
                <td className="th2">{item.part1}</td>
                <td className="th2">{item.category}</td>
                <td className="th2">{item.clients}</td>
                <td className="th3">{item.currency}</td>
                <td className="thcost">{fixPrice(parseInt(item.esti_unit_price))}</td>
              </tr>
            ))
              : <></>}
          </tbody>
        </table>
      </div>
      {/* 페이징 기능 */}
      {count && <Paging page={currentpage} count={count} setPage={setPage} />}
      {checkItems.length > 0 && <button className="pageButton" onClick={removeRow}>선택 삭제</button>}
      {checkItems.length > 0 && <button className="pageButton" onClick={addItemBasket}>선택 저장</button>}
    </>
  );
}
export default SelectedList
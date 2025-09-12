

export default function ReferFriend() {
  return (

    <div className="relative h-[400px] rounded-xl bg-primary-400 hidden md:flex justify-center items-start gap-5 p-6 flex-col overflow-hidden">
    <img src="/Union.png" alt="" className="absolute top-0 right-0 h-30" />
    <img src="/circles-top.png" alt="" className="absolute bottom-[-10px] left-0 h-12" />
    <h2 className="text-white text-5xl font-bold mt-10 mb-2">Refer a friend <br />and get £20</h2>
    <button className="bg-white cursor-pointer w-full py-4 rounded-full hover:bg-[hsl(var(--primary-100))]">Invite Friends</button>
    </div>

  )
}




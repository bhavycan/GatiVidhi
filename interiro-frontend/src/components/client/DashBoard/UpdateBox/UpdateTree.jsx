import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList } from 'recharts';


const UpdateTree = ({ setUpdateOpen }) => {
const updateData = [
  { name: 'Layout', update: 3, uv: 200, pv: 240, fill: '#D8B4FE' },    // light purple
  { name: 'PopChannel', update: 7, uv: 400, pv: 460, fill: '#C084FC' }, // medium purple
  { name: 'Electrification', update: 1, uv: 150, pv: 200, fill: '#A855F7' }, // purple
  { name: 'Ceiling', update: 9, uv: 500, pv: 520, fill: '#9333EA' },    // deep purple
  { name: 'Furniture', update: 0, uv: 50, pv: 90, fill: '#E879F9' },    // light pinkish purple
  { name: 'Laminate', update: 5, uv: 300, pv: 350, fill: '#F472B6' },   // pink
  { name: 'Paint', update: 4, uv: 250, pv: 270, fill: '#EC4899' },      // rose pink
  { name: 'Lights', update: 8, uv: 450, pv: 480, fill: '#DB2777' },     // dark pink
  { name: 'Cleaning', update: 2, uv: 100, pv: 120, fill: '#BE185D' },   // strong magenta
  { name: 'HandOver', update: 6, uv: 350, pv: 390, fill: '#9D174D' },   // deep pink-purple
];




  return (


        <motion.div
          initial={{ opacity: 0,  }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={()=>setUpdateOpen(false)}
          transition={{ duration: .5 }}
          className="fixed inset-0 z-10 px-4 py-3 bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 pb-[10%]"
        >
          <motion.div
           initial={{ opacity: 0, scale : 0, y : 50 }}
          animate={{ opacity: 1 , rotate : 0, scale : 1, y : 0, ease : [0.34, 1.56, 0.64, 1]}}
          exit={{ opacity: 0 , scale : 0, y : 50}}
          transition={ {duration : .5, ease : [0.25, 1, 0.5, 1]}}
          style={{ transformOrigin: "bottom left" }}
          onClick={(e)=> e.stopPropagation()}
          className="w-[90%] relative flex items-center justify-center h-[40%] rounded-lg px-2 py-2 text-black shadow-current bg-white shadow-lg">

  <ResponsiveContainer   width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={updateData}

        margin={{
          top: 15,
          right: 10,
          left: -30,
          bottom: 0,
        }}
      >
        <CartesianGrid  strokeDasharray="3 3" />
        <XAxis dataKey="name"  tick={false} label="Work"  />

        <YAxis />
        <Tooltip  />
        <Bar dataKey="update" fill="#8884d8"     activeBar={<Rectangle fill="pink" stroke="#883bbc" />} >

        </Bar>

      </BarChart>
    </ResponsiveContainer>



          </motion.div>
        </motion.div>

  );
};

export default UpdateTree;

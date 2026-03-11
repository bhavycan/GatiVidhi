import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList } from 'recharts';
import axios from 'axios';

const TASK_COLORS = {
  Layout: '#D8B4FE',
  PopChannel: '#C084FC',
  Electrification: '#A855F7',
  Ceiling: '#9333EA',
  Furniture: '#E879F9',
  Laminate: '#F472B6',
  Paint: '#EC4899',
  Lights: '#DB2777',
  Cleaning: '#BE185D',
  HandOver: '#9D174D',
};

const UpdateTree = ({ setUpdateOpen }) => {
  const [updateData, setUpdateData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/update/task-counts', { withCredentials: true })
      .then(({ data }) => {
        const mapped = data.taskCounts.map(({ name, update }) => ({
          name,
          update,
          fill: TASK_COLORS[name] || '#883bbc',
        }));
        setUpdateData(mapped);
      })
      .catch((err) => console.error('Failed to fetch task counts', err));
  }, []);




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
